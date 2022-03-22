/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

// FIREBASE
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

// SERVICES
import { HttpService } from '@services/http/http.service';
import { AuthService } from '@services/auth/auth.service';
import { NetworkService } from '@services/network/network.service';

// ENV
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  version = 0;
  placeID = environment.serverId;
  hasUpdate = false;
  isActive = false;
  isOnline = false;
  uploadUrl = environment.uploadUrl + '?token=' + sessionStorage.getItem('token');
  ip = environment.ip;

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private http: HttpService,
    private auth: AuthService,
    private networkService: NetworkService
  ) {
    this.hasUpdate = false;
    this.isOnline = this.networkService.isOnline;
  }

  async getVersion() {
    const municipalityData: any = await firstValueFrom(
      this.http.show('municipality', this.placeID)
    );

    if (municipalityData) {
      this.version = +municipalityData.results.version || 0;
    }
  }

  upload(data: any, segment: string, parent = null) {
    const params = {
      error: true,
      message: '',
      result: null,
    };

    return new Promise(async (resolve, reject) => {
      let docRef: AngularFirestoreDocument; let result: any;

      // Check data has sync_id
      if (!data.sync_id) {
        // Increment Version
        data.version = this.version + 1;

        if (this.isActive) {
          // Update documents that has been deleted
          if (segment === 'logs') {
            if (data.action === 'delete') {
              if (data.segment_id) {
                if (data.entity !== 'ordinances') {
                  docRef = this.db
                    .collection('municipalities')
                    .doc(parent)
                    .collection(data.entity)
                    .doc(data.segment_id);
                } else {
                  docRef = this.db.collection(data.entity).doc(data.segment_id);
                }

                const item = await firstValueFrom( docRef.get() );
                if ( item.exists ) {
                  // docRef.update( deletedData );
                  this.hasUpdate = true;
                  await docRef.delete();
                }
              }
            }
          }

          if (parent) {
            result = await this.db
              .collection('municipalities')
              .doc(parent)
              .collection(segment)
              .add(data);
          } else {
            result = await this.db.collection(segment).add(data);
          }
        }

        if (result && result.id) {
          const newData = {
            sync_id: result.id,
            version: data.version,
          };

          const update = await firstValueFrom(
            this.http.update(segment, data.id, newData)
          );

          if (update) {
            this.hasUpdate = true;
            params.error = false;
            params.message = 'Successfully update the data';
            params.result = update;
            resolve(params);
          } else {
            params.error = true;
            params.message = 'Update error! Please try again later';
            params.result = update;
            reject(params);
          }
        }

        params.error = true;
        params.message = 'Update error! Please try again later';
        params.result = data;
        reject(params);
      } else {
        try {
          if (parent) {
            docRef = this.db
              .collection('municipalities')
              .doc(parent)
              .collection(segment)
              .doc(data.sync_id);
          } else {
            docRef = this.db.collection(segment).doc(data.sync_id);
          }

          const item = await firstValueFrom( docRef.get() );

          if (item.exists) {
            this.hasUpdate = true;
            docRef.update(data);
            params.error = false;
            params.message = 'Successfully update the data';
            params.result = item;
            resolve(params);
          }
          params.error = true;
          params.message = 'Upload error! Please try again later';
          params.result = data;
          reject(params);
        } catch (error) {
          params.error = true;
          params.message = 'Upload error! Please try again later';
          params.result = data;
          reject(params);
        }
      }
    });
  }

  async processSync(segment: string) {
    const data: any = await firstValueFrom(
      this.http.get(segment, { version: this.version }, true)
    );

    if (data.results_count) {
      return await Promise.all(
        data.results.map(async (item: any) => {

          if (segment === 'sessions') {
            item.id = item.date;
          } else {
            if (item.number) {
              item.id = item.number;
            }
          }

          if (item.files && item.files.length) {
            await Promise.all(
              item.files.map(async (file: any) => {
                const byteArray = new Uint8Array(file.file.data);
                const blob = new Blob([byteArray], { type: file.type });
                const filename = `${this.placeID}/${segment}/${item.id}/${file.filename}`;
                const snap = await firstValueFrom(
                  this.storage
                  .upload(filename, blob)
                  .snapshotChanges()
                );

                if (snap) {
                  file.file = await snap.ref.getDownloadURL();
                }
              })
            );
          }

          // Add data to the cloud
          const parent = segment === 'ordinances' ? null : this.placeID;
          try {
            await this.upload(item, segment, parent);
          } catch (error) {}
        })
      );
    }
  }

  sync(segment: string = null) {
    const params = {
      error: true,
      message: '',
      result: null,
    };

    return new Promise(async (resolve, reject) => {
      await this.getVersion();
      console.log('VERSION: ', this.getVersion());
      this.hasUpdate = false;
      this.isOnline = false;

      // Get current role
      const role = this.auth.getRole();
      console.log('ROLE: ', role);
      let municipalityData: any = {};

      if (role === 'admin') {
        try {
          // Check if status is active on firebase
          const cloudServerData = await firstValueFrom(
            this.db
            .collection('municipalities')
            .doc(this.placeID)
            .get()
          );

          // Check if collection exists
          municipalityData = cloudServerData.data();

          // Check if municipality exists
          if (cloudServerData.exists) {
            // Check if the municipality is active
            if (!municipalityData.is_active) {
              params.error = true;
              params.message = 'Your account is not active anymore';
              params.result = municipalityData;
              reject(params);
              return false;
            }

            this.isActive = true;
          } else {
            params.error = true;
            params.message = 'Cannot access the server right now';
            params.result = municipalityData;
            reject(params);
            return false;
          }
        } catch (error) {
          params.error = true;
          params.message = 'Cannot access the server right now';
          params.result = municipalityData;
          reject(params);
          reject('Cannot access the server right now');
          return false;
        }

        // Begin uploading

        // Committees
        const committees: any = await firstValueFrom(
          this.http.get('committees', {})
        );

        if (committees.results_count) {
          await this.db
            .collection('municipalities')
            .doc(this.placeID)
            .update({ committees: committees.results })
            .catch((error) => {
              params.error = true;
              params.message = 'Unable to sync committees at the moment';
              params.result = error;
              reject(params);
            });
        }

        // Users
        const users: any = await firstValueFrom(
          this.http.get('users', { version: this.version }, true)
        );

        if (users.results_count) {
          await Promise.all(
            users.results.map(async (user) => {
              if (user.avatar) {
                const byteArray = new Uint8Array(user.avatar.data);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });

                const filename = this.placeID + '/users/' + user.id;

                const snap = await firstValueFrom(
                  this.storage
                    .upload(filename, blob)
                    .snapshotChanges()
                );
                const url = await snap.ref.getDownloadURL();

                user.avatar = url;
              }

              // Add data to the cloud
              const add = await this.upload(user, 'users', this.placeID);

              return add;
            })
          ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync users at the moment';
            params.result = error;
            reject(params);
          });
        }

        // Logs
        const logs: any = await firstValueFrom(
          this.http.get('logs', { version: this.version }, true)
        );

        if (logs.results_count) {
          await Promise.all(
            logs.results.map(async (log: any) => {
              // Add data to the cloud
              const add = await this.upload(log, 'logs', this.placeID);
              return add;
            })
          ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync logs at the moment';
            params.result = error;
            reject(params);
          });
        }

        // References
        const references: any = await firstValueFrom(
          this.http.get('references', { version: this.version }, true)
        );

        if (references.results_count) {
          await Promise.all(
            references.results.map(async (reference) => {
              if (reference.file) {
                const byteArray = new Uint8Array(reference.file.data);
                const blob = new Blob([byteArray], { type: reference.type });

                const filename =
                  this.placeID + '/references/' + reference.filename;

                const snap = await firstValueFrom(
                  this.storage
                  .upload(filename, blob)
                  .snapshotChanges()
                );
                const url = await snap.ref.getDownloadURL();

                reference.file = url;
              }

              // Add data to the cloud
              const add = await this.upload(
                reference,
                'references',
                this.placeID
              );

              return add;
            })
          ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync references at the moment';
            params.result = error;
            reject(params);
          });
        }

        // Members
        const members: any = await firstValueFrom(
          this.http.get('members', { version: this.version }, true)
        );

        if (members.results_count) {
          await Promise.all(
            members.results.map(async (member) => {
              if (member.avatar) {
                const byteArray = new Uint8Array(member.avatar.data);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });

                const filename = this.placeID + '/members/' + member.id;

                const snap = await firstValueFrom(
                  this.storage
                  .upload(filename, blob)
                  .snapshotChanges()
                );
                const url = await snap.ref.getDownloadURL();

                member.avatar = url;
              }

              // Add data to the cloud
              const add = await this.upload(member, 'members', this.placeID);

              return add;
            })
          ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync members at the moment';
            params.result = error;
            reject(params);
          });
        }

        // Sync other segments
        const segments = [
          'ordinances',
          'sessions',
          'resolutions',
          'committee-reports',
          'privilege-speeches',
          'memoranda',
          'accreditations',
          'vehicle-franchises',
          'subdivisions',
          'others',
        ];

        if (segment && segments.includes(segment)) {
          await this.processSync(segment).catch((error) => {
            params.error = true;
            params.message = `Unable to sync ${segment} at the moment`;
            params.result = error;
            reject(params);
          });
        } else {

          for await (const seg of segments) {
            this.processSync(seg).catch((error) => {
              params.error = true;
              params.message = 'Unable to sync all at the moment';
              params.result = error;
              reject(params);
            });
          }
        }

        // Municipality
        const municipality: any = await firstValueFrom(
          this.http.show( 'municipality', this.placeID )
        ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync municipality at the moment';
            params.result = error;
            reject(params);
          });

        // IP Address
        const ip = municipality.results.ip;

        if (municipalityData.ip !== ip) {
          await this.db
            .collection('municipalities')
            .doc(this.placeID)
            .update({ ip })
            .catch((error) => {
              params.error = true;
              params.message = 'Unable to sync municipality at the moment again';
              params.result = error;
              reject(params);
            });
          this.hasUpdate = true;
        }

        // Logo
        // const logoVersion = +municipality.results.logo_version || 0;
        // if (!logoVersion || logoVersion > this.version) {
        //   const logo = municipality.results.logo;

        //   if (logo) {
        //     const byteArray = new Uint8Array(logo.data);
        //     const blob = new Blob([byteArray], { type: 'image/jpeg' });

        //     const filename = this.placeID + '/logo';

        //     const snap = await firstValueFrom(
        //       this.storage
        //       .upload(filename, blob)
        //       .snapshotChanges()
        //     );
        //     const url = await snap.ref.getDownloadURL();

        //     this.hasUpdate = true;
        //     await this.db
        //       .collection('municipalities')
        //       .doc(this.placeID)
        //       .update({ logo: url, logo_version: logoVersion })
        //       .catch((error) => {
        //         params.error = true;
        //         params.message = 'Unable to sync at the moment';
        //         params.result = error;
        //         reject(params);
        //       });
        //   }
        // }

        if (this.hasUpdate) {
          // Update local database version
          const data = {
            version: this.version + 1,
            backup_date: new Date(),
          };
          await firstValueFrom(
            this.http.update('municipality', this.placeID, data)
          ).catch((error) => {
              params.error = true;
              params.message = 'Unable to sync municipality at the moment twice';
              params.result = error;
              reject(params);
            });

          // Update cloud version
          await this.db
            .collection('municipalities')
            .doc(this.placeID)
            .update(data)
            .catch((error) => {
              params.error = true;
              params.message = 'Unable to sync municipality at the moment for the third time';
              params.result = error;
              reject(params);
            });

          params.error = false;
          params.message = 'Successfully sync the data';
          params.result = {};
          resolve(params);
        }
        params.error = false;
        params.message = 'No updated data to be synced';
        params.result = {};
        resolve(params);
      } else if (role === 'user') {
        this.isOnline = false;

        // Check if local or cloud server is available
        try {
          const server: any = await firstValueFrom(this.http
            .show('municipality', this.placeID, this.ip));

          // Check if can access local server
          if (!server || server.error) {
            // Check if cloud server and account is active
            try {
              const cloudServerData = await firstValueFrom(this.db
                .collection('municipalities')
                .doc(this.placeID)
                .get());

              // Check if collection exists
              municipalityData = cloudServerData.data();

              if (cloudServerData.exists && municipalityData.is_active) {
                this.isOnline = true;
              } else {
              }
            } catch (error) {
              params.error = true;
              params.message = 'Unable to access data at the moment';
              params.result = error;
              reject(params);

              return false;
            }
          }

          // Get municipal data
          municipalityData = server.results;
        } catch (error) {
          // Check if cloud server and account is active
          try {
            const cloudServerData = await firstValueFrom(this.db
              .collection('municipalities')
              .doc(this.placeID)
              .get());

            // Check if collection exists
            municipalityData = cloudServerData.data();

            if (cloudServerData.exists && municipalityData.is_active) {
              this.isOnline = true;
            } else {
              params.error = true;
              params.message = 'Unable to access data at the moment';
              params.result = error;
              reject(params);
              return false;
            }
          } catch (e) {
            params.error = true;
            params.message = 'Unable to access data at the moment';
            params.result = error;
            reject(params);
            return false;
          }
        }

        if (municipalityData.version === this.version && this.isOnline) {
          params.error = false;
          params.message = 'Your data is up to date';
          params.result = municipalityData;
          resolve(params);
        } else {

          if (!this.isOnline) {
            const committeeCollection: any = await firstValueFrom(this.http
              .get('committees', { version: this.version }, true, this.ip));

            // Committee
            municipalityData.committees = committeeCollection.results || [];
          }

          try {
            // Committee
            await firstValueFrom(this.http
              .sync('committees', municipalityData.committees));

            // Clear committees
            delete municipalityData.committees;

            // Add server id
            municipalityData.server_id = this.placeID;

            if (municipalityData.logo_version <= this.version) {
              delete municipalityData.logo;
            }

            await firstValueFrom(this.http.sync('municipality', municipalityData));

            // Sync other segments
            const segments = [
              'logs',
              'ordinances',
              'sessions',
              'resolutions',
              'committee-reports',
              'privilege-speeches',
              'memoranda',
              'accreditations',
              'vehicle-franchises',
              'subdivisions',
              'others',
              'references',
              'members',
            ];

            if (segment && segments.includes(segment)) {
              await this.userSync(segment).catch((e) => reject(e));
            } else {
              for await (const seg of segments ) {
                this.userSync(seg).catch((e) => reject(e));
              }
            }

          } catch (error) {
            params.error = true;
            params.message = 'Unable to access data at the moment';
            params.result = error;
            reject(params);
            return false;
          }

          this.http
            .update('municipality', this.placeID, {
              version: municipalityData.version,
            })
            .subscribe(
              (data: any) => {
                params.error = false;
                params.message = 'Successfully updated the municipality data';
                params.result = data;
                resolve(params);
              },
              (error) => {
                params.error = true;
                params.message = 'Unable to access data at the moment';
                params.result = error;
                reject(params);
              }
            );
        }
      }
    });
  }

  userSync(segment: string) {

    const params = {
      error: true,
      message: '',
      result: null
    };

    return new Promise(async (resolve, reject) => {
      let data = [];
      let collection: any;

      if (this.isOnline) {
        if (segment !== 'ordinances') {
          collection = await firstValueFrom(this.db
            .collection('municipalities')
            .doc(this.placeID)
            .collection(segment, (ref) =>
              ref.where('version', '>', this.version)
            )
            .get())
            .catch((error) => {
              params.error = true;
              params.message = 'Unable to sync at the moment';
              params.result = error;
              reject(params);
            });
        } else {
          collection = await firstValueFrom(this.db
            .collection(segment, (ref) =>
              ref
                .where('version', '>', this.version)
                .where('place_id', '==', this.placeID)
            )
            .get())
            .catch((error) => {
              params.error = true;
              params.message = 'Unable to sync at the moment';
              params.result = error;
              reject(params);
            });
        }

        // Get the data from the collection
        data = collection.docs.map((doc: any) => doc.data());
      } else {
        collection = await firstValueFrom (this.http
          .get(segment, { version: this.version }, true, this.ip))
          .catch((error) => {
            params.error = true;
            params.message = 'Unable to sync at the moment';
            params.result = error;
            reject(params);
          });
        data = collection.results || [];
      }

      if (data.length) {
        if (segment === 'logs') {

          for await (const log of data) {
            this.http.destroy(log.entity, log.entity_id);
          }

        } else {
          await Promise.all(
            data.map(async (item) => {
              if (item.avatar) {
                if (!this.isOnline) {
                  const file = {
                    file: item.avatar,
                    filename: 'avatar.jpg',
                    type: 'image/jpeg',
                  };
                  const upload = await firstValueFrom(this.http.upload(file));
                  item.avatar = upload.file.filename;
                }
              } else if (item.file) {
                if (!this.isOnline) {
                  const upload = await this.http.upload(item).toPromise();
                  item.file = upload.file.filename;
                }
              } else {
                if (item.files && item.files.length) {
                  await Promise.all(
                    item.files.map(async (file: any) => {
                      if (!this.isOnline) {
                        const upload = await this.http.upload(file).toPromise();
                        file.file = upload.file.filename;
                      }
                      return file;
                    })
                  );
                }
              }

              await this.http
                .sync(segment, item)
                .toPromise()
                .catch((error) => {
                  params.error = true;
                  params.message = 'Unable to sync at the moment';
                  params.result = error;
                  reject(params);
                });
            })
          ).catch((error) => {
            params.error = true;
            params.message = 'Unable to sync at the moment';
            params.result = error;
            reject(params);
          });;
        }
      }

      params.error = false;
      params.message = 'Successfully sync the data';
      params.result = {};
      resolve(params);

    });
  }
}
