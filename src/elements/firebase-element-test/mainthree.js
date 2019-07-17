/*********
 * Main.js
 * keep this change
 * ************/

json = window.JSON;
function obj(){}
function addKeyVal(key, val, obj){
//requires that an object is passed in.
  obj[key] = val;
}
/*logout = function(){
  console.log('logout');
        document.querySelector('firebase-auth').logout();
};
login = function(){
  console.log('login');
        document.querySelector('firebase-auth').login();
};*/
var exposed = null;
(function(document) {
  'use strict';
  var app = document.querySelector('#app');
  exposed = app;
  /*******************************
   * Version of Polymer here does not fire 
   * webcomponents ready, The following should
   * be initialized after components are ready
   * The version on the server works for 
   * webcomponents ready
   **********************************/
  app.firebaseAuth = document.querySelector('firebase-auth');
  //Some of these are not needed they are set in the markup
  app.firebaseURL = 'https://crosscut.firebaseio.com';
  app.firebaseProvider = 'google'; // We will send this in the function call
  
  /**********
   * add event listeners
   ******************/
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    console.log('WebcomponentsReady fired');
  }); 
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });
  
  app.handleReviewsAJAX = function(event){
    console.log('anything');
    console.log("This is response: "+event.detail.response);
  };

  app.onFirebaseError = function(event) {
    //This is an event that is provided by firbase-auth element
    //A reference has been made to the element so we can dig into
    //its internals from app.firebaseAuth
    //Again polymer observers are somthing else that just work
    //Using on-function name in the elements attribute the 
    //value of that attribute is automatically turned into an observer
    //event that calls a function with the value in the attribute. 
    //when the function in the elements is run that is reference with 
    //on-* in element attribute * = function name in element. 
    //The value is the function to call when that fun runs
    console.log('entered on firebase error event');
    this.$.errorToast.text = event.detail.message;
    this.$.errorToast.show();
  };
  
  app.startListeningToUser = function(){
    //onFirebaseLogin must run before this
    //is called or an error will be given
    app.refUserId.on('value', function (snapshot) {
      /*******************************************************************
      //Something in userId changed, could be a permission
      //re-initialize all dependent functionality and variables
      //This helps ensure you cannot access other peoples information
      //without the authority to do so. If this does not run the permission
      //update will be changed on service but our clientside functionality
      //and data will not reflect because it may be in a different branch
      //The data restrictions will be applied on the data service, and
      //the user will ultimately recieve an error if they try to update
      //or read what they are not allowed to. We just remove the references
      //to that information and give a popup on regressed permission to
      //tell the user to call or contact admin that changed their perms with 
      //questions.
      *********************************************************************/
      if(snapshot.exists()){
        //Todo: Expose the refs that are accessable - use permission list
        //Set refs that are not accessable as null -- firebase does not tell
        //us if they are accessable until we try. We can run a permission
        //list check for user without making perm group list accessable by
        //Trying to access a node with the permissions we seek, that node
        //should list the reference paths for the given group that can be
        //read or written, some processing will need to be done on the paths
        //returned as they may have variables that need to be replaced with
        //values already on the client. If the permGroup path list is not
        //accessable we move down and check the next permission level. All
        //users not in a permission level are at a default public user level
        //the refs as well as the ons functions that keep our data synced will
        //be processed from this list setting the basic need of user. we will
        //sublist or do something later if the reload performance is a big deal
        app.refUserItems = app.ref.child('items/'+app.firebaseAuth.user.uid+'/items'); //test data
        app.refUserReferrals = app.ref.child('referrals/');
        app.itemCountRef = app.ref.child('items/'+app.firebaseAuth.user.uid+'/count');
        app.referralCountRef = app.ref.child('users/'+app.firebaseAuth.user.uid+'/referralCount');
        app.userGroupsRef = app.ref.child('permissionGroups');
        app.refUserItems.on('value', function (itemsSnapshot) {
          app.updateItems(itemsSnapshot);
        });
        app.refUserReferrals.on('value', function (referralSnapshot){
          app.updateReferrals(referralSnapshot);    
        });
      }else{
        app.$.errorToast.text = 'User not provisioned - Try logging out and back in';
        app.$.errorToast.show();
      }
    }, function (err) {
      if(!app.firebaseAuth.user){ 
      app.$.errorToast.text = 'You are now logged out - Thank you for visiting';
      app.$.errorToast.show();
        console.log('It is safe to assume the user has logged out - unable to sync data');
      }else{
      app.$.errorToast.text = 'Unable to read user - call admin '+err;
      app.$.errorToast.show();
      console.log('Unable to read user '+err);
      }
    });    
  };
  
  /**************
   * ************/
  app.onFirebaseLogout = function(event){console.log('yes you did get a logout event');};
  app.onFirebaseLogin = function(event) {
    //firebaseAuth should be exposed on webcomponents ready
    console.log("this is the auth data"+json.stringify(app.firebaseAuth.user));
    //Only create the references we need, the remaining will be constructed
    //from data supplied to the users permission level.
    this.ref = new Firebase('https://crosscut.firebaseio.com');  
    this.refUserId = this.ref.child('users/'+app.firebaseAuth.user.uid);
    this.refUserId_IdValue = this.ref.child('users/'+app.firebaseAuth.user.uid+'/idValue');
    this.refUserId_IdValue.once('value', function (dataSnapshot) {
          if(dataSnapshot.exists()){
            app.startListeningToUser();
          }else{
            var userObj = new obj();
            addKeyVal('idValue', app.firebaseAuth.user.uid, userObj);
            //addKeyVal('permGroup','user',userObj);
            app.refUserId.update(userObj,function(err){
              if(err === null){app.startListeningToUser();}
              else{
                app.$.errorToast.text = 'Unable to provision user '+err;
                app.$.errorToast.show();
                console.log('Unable to provision user '+err);
              }
            });
          }
    }, function (err){
      app.$.errorToast.text = 'User does not have permission - contact admin '+err;
      app.$.errorToast.show();
      console.log('userId/idValue.once - user does not have permission'+err);      
    });
  };
  app.openToast = function() {
    //This is the function I used when testing toast it can be removed
    this.$.toast.open();
  };
  
  /*************
   * Here we update the array of items that is 
   * binded to the user interface so updates are seen
   **************************************************/
  app.updateItems = function(snapshot) {
    this.items = [];
    snapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      item.uid = childSnapshot.key();
      //console.log('items stringify: '+json.stringify(item));
      this.push('items', item);
      //this.push();
      //app.items.push(app.itemTemp);
      console.log('items: '+json.stringify(childSnapshot.val()));
    }.bind(this));
  };
  /*************
   * Here we update the array of referrals that is 
   * binded to the user interface so updates are seen
   **************************************************/
  app.updateReferrals = function(snapshot) {
    this.referrals = [];
    snapshot.forEach(function(childSnapshot) {
      var referral = childSnapshot.val();
      referral.id = childSnapshot.key();
      this.push('referrals', referral);
      
      console.log('referrals: '+json.stringify(childSnapshot.val()));
    }.bind(this));
  };
  /*******************
   * The following functions are
   * Create read and update for user items
   * (transactions / count increment too)
   *********************************/
  app.items = [];
  app.referrals = [];
  /***********
   *Add Item
   **********/
  app.addItem = function(event) {
    event.preventDefault(); // Don't send the form!
    this.itemCountRef.transaction(function (count) {
      return (count || 0) + 1;
    });
    this.refUserItems.push({
      done: false,
      text: app.newItemValue
    });
    app.newItemValue = '';
  };
  /***********
   *Add Referral 
   **********/
  app.addReferral = function(event){
    event.preventDefault(); // Don't send the form
    
    /*onUserReady(function(){
        app.referralCountRef.transaction(function (count){
            return (count || 0) +1;  
        });
        app.refUserReferrals.push({
          userId: "google:106497318782063698395",
          displayName: "testDisplayName",
          text: app.newReferralValue
        });
        app.newReferralValue = '';
    });*/
    
    this.referralCountRef.transaction(function (count){
      return (count || 0) +1;  
    });
    this.refUserReferrals.push({
      userId: "google:106497318782063698395",
      displayName: "testDisplayName",
      text: app.newReferralValue
      
    });
    app.newReferralValue = '';
  };
  
  app.toggleItem = function(event) {
    this.refUserItems.child(event.model.item.uid).update({done: event.model.item.done});
  };
  
  app.deleteItem = function(event) {
    this.refUserItems.child(event.model.item.uid).remove();
    this.itemCountRef.transaction(function (count) {
      return (count || 0) - 1;
    });
  };
  
  app.addPermissionGroup = function(){
    //only someone with systemadmin group
    //will be able to enhance to change
    //permissions, this individual must
    //complete actions within a time range
    //declared on the client function enhance Permission
    //default permissions given to a systemadmin
    //are admin, they are able to enhance with
    //current authentication, no reauth needed
    //the list of references accessable will be
    //changed on enhancement. To change permission
    //the system admin must enter a valid json
    //object in the textbox on first implimentation
    //They will be able to create new groups and 
    //add individuals to groups... a subsystem
    //admin group will eventually be available for
    //more granular permissions, subadmin will
    //be restricted in what permissions they can
    //give, this is because system admin does not 
    //want to do everything and a client owner
    //should be able to give perms to other users
    //to manage the accounts that they are current
    //primary gentleman or lady on.
  };

  

})(document);
