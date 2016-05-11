import { Accounts } from 'meteor/accounts-base';
import { Router, browserHistory} from 'react-router';


Accounts.onLogin((user) => {
  browserHistory.push('/');
});
