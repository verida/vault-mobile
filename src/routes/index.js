import React from 'react';

import Start from '../pages/Account/Start';

import CreateAccount from '../pages/Account/Create';
import VerifyPhrase from '../pages/SeedPhrase/VerifyPhrase';

import CreatePin from '../pages/Authentication/CreatePin';
import ChangePin from '../pages/Authentication/ChangePin';

import Success from '../pages/Success';
import Settings from '../pages/Settings';

import ImportAccount from '../pages/Account/Import';
import SelectNetwork from '../pages/SelectNetwork';

import Inbox from '../pages/Inbox';
import InboxItem from '../pages/InboxItem';

import LoginRequest from '../pages/Login/LoginRequest';
import LoginHistory from '../pages/Login/LoginHistory';

import Profiles from '../pages/Dashboard/Profiles';
import PublicProfile from '../pages/Profiles/PublicProfile';
import PrivateProfile from '../pages/Profiles/PrivateProfile';
import EditProfile from '../pages/Profiles/EditProfile';

import SeedPhrase from '../pages/SeedPhrase/SeedPhrase';
import SeedPhraseGenerated from '../pages/SeedPhrase/SeedPhraseGenerated';
import SeedPhraseView from '../pages/SeedPhrase/SeedPhraseView';
import SeedPhraseEntered from '../pages/SeedPhrase/SeedPhraseEntered';

import Home from '../pages/Dashboard/Home';

import DataFolders from '../pages/Data/Folders';
import DataFolder from '../pages/Data/Folder';
import DataItem from '../pages/Data/Item';
import Credential from '../pages/Credential';

import DashboardTabs from '../components/Navigation/DashboardTabs';

import {
  CHANGE_PIN,
  CREATE_ACCOUNT,
  CREATE_PIN,
  CREDENTIAL_DETAILS,
  DASHBOARD,
  DATA,
  DATA_FOLDER,
  DATA_ITEM,
  EDIT_PROFILE,
  HOME,
  IMPORT_ACCOUNT,
  INBOX,
  INBOX_ITEM,
  LOGIN_HISTORY,
  LOGIN_REQUEST,
  PRIVATE_PROFILE,
  PROFILES,
  PUBLIC_PROFILE,
  SEED_PHRASE,
  SEED_PHRASE_ENTERED,
  SEED_PHRASE_GENERATED,
  SEED_PHRASE_VIEW,
  SELECT_NETWORK,
  SETTINGS,
  START,
  SUCCESS,
  VERIFY_PHRASE
} from '../constants/route';

import HomeSvg from '../assets/navigation/home.svg';
//import CredentialSvg from '../assets/navigation/credential.svg';
import DataSvg from '../assets/navigation/data.svg';
import ProfilesSvg from '../assets/navigation/profiles.svg';

const Routes = (props) => {
  return (
    <Router>
      <Scene key="root">
        <Scene key={START} component={Start} hideNavBar={true} initial={!props.authorized} type="reset" />

        <Scene key={DASHBOARD} tabs={true} tabBarPosition="bottom" initial={props.authorized} tabBarComponent={DashboardTabs} hideNavBar={true} >
          <Scene key={HOME} component={Home} title="Home" hideNavBar={true} icon={HomeSvg} />
          {/* <Scene key={CREDENTIALS} component={Credentials} title="Credentials" hideNavBar={true} icon={CredentialSvg} /> */}
          <Scene key={DATA} component={DataFolders} title="Data" hideNavBar={true} icon={DataSvg} />
          <Scene key={PROFILES} component={Profiles} title="Profiles" hideNavBar={true} icon={ProfilesSvg} />
        </Scene>

        <Scene key={CREDENTIAL_DETAILS} component={Credential} hideNavBar={true} clone={true} />

        <Scene key={CREATE_ACCOUNT} component={CreateAccount} hideNavBar={true} />
        <Scene key={SEED_PHRASE} component={SeedPhrase} hideNavBar={true} />
        <Scene key={SEED_PHRASE_GENERATED} component={SeedPhraseGenerated} hideNavBar={true} />
        <Scene key={VERIFY_PHRASE} component={VerifyPhrase} hideNavBar={true} />
        <Scene key={CREATE_PIN} component={CreatePin} hideNavBar={true} type="reset" />
        <Scene key={SUCCESS} component={Success} hideNavBar={true} />
        <Scene key={SETTINGS} component={Settings} hideNavBar={true} clone={true} />

        <Scene key={CHANGE_PIN} component={ChangePin} hideNavBar={true} />

        <Scene key={IMPORT_ACCOUNT} component={ImportAccount} hideNavBar={true} />
        <Scene key={SELECT_NETWORK} component={SelectNetwork} hideNavBar={true} />
        <Scene key={SEED_PHRASE_ENTERED} component={SeedPhraseEntered} hideNavBar={true} />

        <Scene key={INBOX} component={Inbox} clone={true} hideNavBar={true} />
        <Scene key={INBOX_ITEM} component={InboxItem} clone={true} hideNavBar={true} />

        <Scene key={LOGIN_HISTORY} component={LoginHistory} hideNavBar={true} clone={true} />
        <Scene key={LOGIN_REQUEST} component={LoginRequest} hideNavBar={true} />

        <Scene key={PUBLIC_PROFILE} component={PublicProfile} hideNavBar={true} clone={true} />
        <Scene key={PRIVATE_PROFILE} component={PrivateProfile} hideNavBar={true} clone={true} />
        <Scene key={EDIT_PROFILE} component={EditProfile} hideNavBar={true} />
        <Scene key={SEED_PHRASE_VIEW} component={SeedPhraseView} hideNavBar={true} clone />

        <Scene key={DATA_FOLDER} component={DataFolder} hideNavBar={true} clone />
        <Scene key={DATA_ITEM} component={DataItem} hideNavBar={true} clone />
      </Scene>
    </Router>
  );
};
export default Routes;
