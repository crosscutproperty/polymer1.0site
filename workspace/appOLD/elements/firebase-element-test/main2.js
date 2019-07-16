json = window.JSON;
function obj(){}
function addKeyVal(key, val, obj){
//requires that an object is passed in.
  obj[key] = val;
}

(function(window, document, undefined) {
  'use strict';
  var app = document.querySelector('#app');
  app.firebaseAuth = document.querySelector('firebase-auth');
    
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
  
  app.onFirebaseError = function(event) {
    console.log('entered on firebase error event');
    this.$.errorToast.text = event.detail.message;
    this.$.errorToast.show();
  };
  
  app.startListeningToUser = function(){
    app.refUserId.on('value', function (snapshot) {
      if(snapshot.exists()){
        app.refUserItems = app.ref.child('items/'+app.firebaseAuth.user.uid+'/items'); 
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
  
  app.onFirebaseLogin = function(event) {
    console.log("this is the auth data"+json.stringify(app.firebaseAuth.user));
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
  
  
    
    
    
})(window,document);