TimeEntries.attachSchema(new SimpleSchema({
  trelloId: {
    type: String,
    optional: true
  }
}));

TrelloSync = {
  _trello: (new Trello(Meteor.settings.trello.key, Meteor.settings.trello.token)),

  _hoursToText( hours ){
    return Number(hours.toFixed(2));
  },

  _titleActualRegex: new RegExp( /\[(.+?)\]/),
  _stripActualHours(name){
    name = name.replace(this._titleActualRegex,'');
    name = name.trim();
    return name;
  },
  _appendActualHours( name, hours ){
    // This is needed to get a number with at most 2 decimals,
    // that also doesn't have trailing zeros
    return name + " [" + this._hoursToText( hours ) + "]";
  },


  /*
   * Card specific helpers
   */
  _setName( id, name ){
    this._trello.put('/1/cards/' + id, {name: name},Meteor.bindEnvironment(function(err){
      if( err ){
        console.error( err );
      }
    }));
  },
  _getName( id, callback ){
    callback = Meteor.bindEnvironment( callback );
    this._trello.get('/1/cards/' + id, function(err,resp){
      if( err ){
        console.error( err );
        callback( err );
      }else{
        callback( undefined, resp.name );
      }
    });
  },
  _addComment( id, hours ){
    var text = "Actual hours changed to " + this._hoursToText( hours );
    this._trello.post(
      '/1/cards/' + id + "/actions/comments", {text: text},
      Meteor.bindEnvironment(function(err){
        if( err ){
          console.error( err );
        }
      })
    );
  },

  _getCardSum( id ){
    let durations = TimeEntries.find({trelloId: id}).map((te) => te.duration );

    let durationsWithoutNull = _.without( durations, undefined );

    let sum = _.reduce( durationsWithoutNull, (sum, d) => sum + d, 0);
    return sum;
  },

  _updateCard( id, callback ){
    var self = this;
    self._getName( id, function( err, oldName ){
      if( err ){ callback(); return; }
      var name = self._stripActualHours( oldName );

      var sum = self._getCardSum( id );
      var newName = self._appendActualHours( name, sum );
      if( newName !== oldName ){
        console.log( "Changing " + id + " from " + oldName + " to " + newName );
        self._setName( id, newName );

        self._addComment( id, sum );
      }
      if( callback ){
        callback();
      }
    });
  },

  // Default to 1 day updated since, could potentially do something more robust here
  update( updatedSince, maxDate ){
    var self = this;
    if( !updatedSince ){
      updatedSince = moment.tz( Meteor.settings.timezone ).add( -14, 'days').toDate();
    }

    query = { date: {$gt: updatedSince} };

    if( maxDate  ){
      query.date['$lt'] = maxDate;
    }

    var trelloIds = TimeEntries.find( query ).map((te) => te.trelloId);

    var uniqTrelloIds = _.uniq( trelloIds );
    console.log( 'Updating ' + uniqTrelloIds.length + ' cards' );

    let syncUpdateCard = function( index ){
      if( uniqTrelloIds.length === index ){ return; }
      console.log( "Updating card " + uniqTrelloIds[index] );

      self._updateCard( uniqTrelloIds[index], function(err){
        if( err ){
          syncUpdateCard( index );
        }else{
          syncUpdateCard( index + 1  );
        }
      });
    }
    syncUpdateCard( 0 );
  },
};
