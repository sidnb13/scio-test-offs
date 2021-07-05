/**
* Permissions.gs
* By Sidharth Baskaran, last edit on 3/3/21
* Goal: to manage Google Drive access permissions of tests
*/

/**
 * Uses DriveApp to manage permissions of files in block-specific manner
 */
function managePermissions(blockNum, eventData, revoke) {
    //Loop through event data structure with specified block and manage permissions
    for (let event of eventData) {
      var testDocument = DriveApp.getFileById(extractId(event.url));
      let eventAddresses = event.blockAddresses.split(/,/);
      let flexAddresses = event.flexAddresses.split(/,/);

      //decide whether permission is to be revoked or not and act accordingly
      if (!revoke) {
          if (event.blockNumber == blockNum) {

            //Logger.log(eventAddresses);

            if (blockNum != bC.length - 1) {
                for (let riskyAddress of eventAddresses) {
                    add = riskyAddress.trim();
                    if (add != '') {
                      //Logger.log(add);
                      try {
                        insertSilentPermission(extractId(event.url),add,'user','reader');
                      } catch (e) {
                        Logger.log(`Failed to share the ${event.name} test with "${add}"\nWill skip this address and continue execution`)
                      }
                    }
                }
            } else if (blockNum == bC.length - 1) {
                for (let riskyAddress of flexAddresses) {
                    add = riskyAddress.trim();
                    if (add != '') {
                      try {
                        insertSilentPermission(extractId(event.url),add,'user','reader');
                      } catch (e) {
                        Logger.log(`Failed to share the ${event.name} test with "${add}"\nWill skip this address and continue execution`)
                      }
                    }
                }
            }
          }
      } else {
          users = testDocument.getViewers();
          for (i in users) {
            email = users[i].getEmail();
            if (email != "")
              testDocument.removeViewer(email);
          }
      }
    }
}

/**
 * Insert a new permission without sending notification email.
 *
 * @param {String} fileId ID of the file to insert permission for.
 * @param {String} value User or group e-mail address, domain name or
 *                       {@code null} "default" type.
 * @param {String} type The value "user", "group", "domain" or "default".
 * @param {String} role The value "owner", "writer" or "reader".
 */
function insertSilentPermission(fileId, value, type, role) {
  var request = Drive.Permissions.insert({
    'value': value,
    'type': type,
    'role': role,
  },
  fileId,
  {
    'sendNotificationEmails': false
  });
}

/**
 * extract id from url
 */
const extractId = (url) => {return url.split(/\/+/)[4];};

/**
 * Reset permissions, not to be used during test-offs window
 * Takes a long time to execute
 */
const resetPermissions = (config) => {
  if (config == null)
    config = eventConfig;
  for (let i = 0; i < bC.length; ++i)
      managePermissions(i,config,true);
}
