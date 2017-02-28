
/**
 * @ngdoc service
 * @name pinboredWebkitApp.services.Bookmarkservice
 * @description
 * # Utilservice
 * Service in the pinboredWebkitApp.services.
 */
angular.module('pinboredWebkitApp.services')
  .service('Bookmarkservice', ['$q', '$rootScope', '$filter', 'Pinboardservice', 'Appstatusservice', 
    'Usersessionservice', 'Utilservice', 'Events', 
    function ($q, $rootScope, $filter, Pinboardservice, Appstatusservice, 
      Usersessionservice, Utilservice, Events) {
    // AngularJS will instantiate a singleton by calling 'new' on this function




    // filter buffer
    this.filterBuffer = {};

    // in memory cached bookmarks
    this.storedBookmarkData = {};

    this.storeBookmarkData = function(pinboardData) {
      this.storedBookmarkData = pinboardData;
    };




    // FILTERBUFFER FUNCTIONS




    this.recreateFilterBuffer = function() {
      // console.log('recreating filter buffer...');
      // temp self reference
      var self = this;
      
      // declare filter buffer
      this.filterBuffer = {
        hasBuffer : false,
        tagFilterType : false,
        tags : [],
        text : ''
      };
    };

    this.hasFilterBuffer = function() {
      console.log('hasFilterBuffer ? ' + this.filterBuffer.hasBuffer);
      return this.filterBuffer.hasBuffer;
    };

    this.clearFilterBuffer = function() {
      console.log('clearing filter buffer...');
      // and recreate filter buffer
      this.recreateFilterBuffer();
    };




    // BOOKMARK SUPPORT FUNCTIONS




    this.loadBookmarks = function(loadType, amount) {
      if(loadType === 'recent') {
        // get (amount of) recent bookmarks
        return Pinboardservice.getRecentBookmarks(amount);
      }
      if(loadType === 'all' || loadType === 'filtered') {
        // get all bookmarks
        return Pinboardservice.getAllBookmarks();
      }
    };

    this.createBookmarkObjects = function(pinboardData) {
      var bookmarks = [];

      for(var i=0; i<pinboardData.length; i++) {
        var bmdata = pinboardData[i];
        var bookMark = {
          status: {
            selected : false,
            showEdit : false,
            hasChanged : false,
            staleness : 'unknown'
          },
          data: bmdata
        };
        bookmarks.push(bookMark);
      }

      // cache bookmarks in usersession
      this.storeBookmarkData(pinboardData);

      // and return bookmark objects
      return bookmarks;
    };

    


    // BATCH SELECTION SUPPORT FUNCTIONS




    this.selectionAddTag = function(newTagName, selection) {
      var total = selection.length;
      var updated = 0;
      console.log('bookmarks to add tags to: ' + total);

      if(selection.length > 0) {
        for(var i=0; i<selection.length; i++) {
          // following is inside anonymous function closure because of loop iterator scope problem
          (function(i, newTagName){
            // set initial status to checking
            selection[i].data.tags += ' ' + newTagName;
            // update bookmark
            Pinboardservice.updateBookmark(selection[i])
            .then(function(result) {
              var updatedBmHash = selection[i].data.hash;
              updated++;
              if(result.result_code === 'done') {
                Appstatusservice.updateStatus('updated bookmark: ' + updatedBmHash + '.', updated, total);
                $rootScope.$broadcast(Events.tag.create, selection[i]);
              } else {
                Appstatusservice.updateStatus('Failed: ' + result.result_code + '.', updated, total, 'danger');
              }
            }, function(reason) {
              Appstatusservice.updateStatus('Failed: ' + reason, updated, total, 'danger');
            });
          })(i, newTagName);
        }
      }
    };

    this.selectionDeleteAllTags = function(selection) {
      var total = selection.length;
      var updated = 0;
      console.log('bookmarks to delete all tags from: ' + total);

      // delete all tagsfunction.
      var deleteTagsFromNextBookmark = function(i) {
        if(selection.length > 0 && updated !== total) {
          // remove all tags from bookmark
          selection[i].data.tags = '';
          Pinboardservice.updateBookmark(selection[i])
          .then(function(result) {
            if(result.result_code === 'done') {
              var updatedBmHash = selection[i].data.hash;
              updated++;
              Appstatusservice.updateStatus('updated bookmark: ' + updatedBmHash + '.', updated, total);
              $rootScope.$broadcast(Events.batch.alltagsremoved, selection[i]);
              // recursively delete all tags on next bookmark
              if(selection.length > 0 && updated !== total) {
                deleteTagsFromNextBookmark(i+1);
              }
            } else {
              Appstatusservice.updateStatus('Failed: ' + result.result_code + '.', updated, total, 'danger');
            }
          }, function(reason) {
            Appstatusservice.updateStatus('Failed: ' + reason, updated, total, 'danger');
          });
        } else {
          Appstatusservice.updateStatus('done deleting all tags from all selected bookmarks.');
        }
      };

      deleteTagsFromNextBookmark(0);
    };

    this.selectionStaleCheck = function(selection) {
      var total = selection.length;
      var checked = 0;
      console.log('bookmarks to stale check: ' + total);

      if(selection.length > 0) {
        for(var i=0; i<selection.length; i++) {
          // following is inside anonymous function closure because of loop iterator scope problem
          (function(i){
            // set initial status to checking
            selection[i].status.staleness = 'checking';
            // perform the check url request
            Pinboardservice.checkUrl(selection[i].data.href)
            .then(function(result) {
              var checkedBmHash = selection[i].data.hash;
              checked++;
              if(result === 200) {
                Appstatusservice.updateStatus('checked bookmark is healthy: ' + checkedBmHash + '.', checked, total);
                selection[i].status.staleness = 'healthy';
              } else {
                Appstatusservice.updateStatus('checked bookmark is stale: ' + checkedBmHash + '.', checked, total);
                selection[i].status.staleness = 'dead';
              }
              if(checked === total) {
                Appstatusservice.updateStatus('done stale checking all selected bookmarks.');
              }
            }, function(reason) {
              Appstatusservice.updateStatus('Failed: ' + reason, checked, total, 'danger');
              selection[i].status.staleness = 'unknown';
            });
          })(i);
        }
      }
    };

    this.selectionRecursiveDelete = function(selection) {
      var total = selection.length;
      var deleted = 0;

      console.log('bookmarks to delete: ' + total);

      // dispatch start of batch event
      $rootScope.$broadcast(Events.batch.start);

      var mockDelete = function(bmHref) {
        console.log('mock removing bookmark: ', bmHref);
        var deferred = $q.defer();
        setTimeout(function() {
          deferred.resolve({result_code: 'done'});  
        }, 500);
        return deferred.promise;
      };

      // RECURSIVE delete single bookmark function.
      var deleteNextBookmark = function() {
        
        if(selection.length > 0 && deleted !== total) {
          Pinboardservice.deleteBookmark(_.first(selection).data.href)
          // mockDelete(_.first(selection).data.href)
            .then(function(result) {
              if(result.result_code === 'done') {
                var deletedBm = selection.shift();
                var deletionBmHash = deletedBm.data.hash;
                deleted++;
                // send app status update
                Appstatusservice.updateStatus('deleted bookmark, hash: ' + deletionBmHash + '.', deleted, total);
                // remove from scope list
                $rootScope.$broadcast(Events.bm.delete, deletedBm);
                // recursively delete next bookmark
                if(selection.length > 0 && deleted !== total) {
                  deleteNextBookmark();
                }
              }
            }, function(reason) {
              Appstatusservice.updateStatus('Failed: ' + reason, deleted, total, 'danger');
            });
        } else {
          // dispatch end of batch event
          $rootScope.$broadcast(Events.batch.end);
          Appstatusservice.updateStatus('done deleting all selected bookmarks.');
        }
      };

      // delete the first bookmark and start recursion
      deleteNextBookmark();
    }




    // INDIVIDUAL BOOKMARK SUPPORT ACTIONS




    this.deleteBookmark = function (bookmarkItem, collection) {
      var responseFailed = function(message) {
        Appstatusservice.updateStatus('Failed to delete bookmark: ' + message + '.', 0, 0, 'danger');
      };

      Pinboardservice.deleteBookmark(bookmarkItem.data.href)
        .then(function(result) {
          if(result.result_code === 'done') {
            console.log('delete request completed.');
            Utilservice.removeItemFromCollection('hash', bookmarkItem.data.hash, collection);
            Appstatusservice.updateStatus('deleted bookmark, hash: ' + bookmarkItem.data.hash + '.');
            $rootScope.$broadcast(Events.bm.delete, bookmarkItem);
          } else {
            responseFailed(result);
          }
        }, function(reason) {
          responseFailed(reason);
        });
    };

    this.staleCheckBookmark = function(bookmark) {
      bookmark.status.staleness = 'checking';
      Pinboardservice.checkUrl(bookmark.data.href)
      .then(function(result) {
        if(result === 200) {
          console.info('bookmarkitem healthy! ' + result);
          bookmark.status.staleness = 'healthy';
        } else {
          console.info('bookmarkitem STALE! ' + result);
          bookmark.status.staleness = 'dead';
        }
      }, function(reason) {
        console.info('bookmarkitem STALE! ' + reason);
        bookmark.status.staleness = 'dead';
      });
    };

    this.getBookmarkTags = function(bookmark) {
      console.log('bookmarkservice :: getBookmarkTags... ');
      var self = this;
      
      return bookmark.tags.split(' ');
    };

    this.hasBookmarkTag = function(bookmark, tagName) {
      console.log('bookmarkservice :: hasBookmarkTag... ');
      var self = this;
      
      return bookmark.tags.split(' ').indexOf(tagName) > -1;
    };




    // SETUP AND INITIALISATION




    this.recreateFilterBuffer();

  }]);
