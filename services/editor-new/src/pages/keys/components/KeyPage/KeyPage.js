import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import * as alertActions from '../../../../store/ducks/alerts';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import routeLeaveHook from '../../../../hoc/route-leave-hook';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';

const diff = require('deep-diff').diff;

const onRouteLeaveConfirmFunc = (props) => {
  if (!props.selectedKey || props.selectedKey.isSaving) return false;

  const { local, remote } = props.selectedKey;
  const changes = diff(local, remote);
  const hasChanges = (changes || []).length > 0;

  return hasChanges;
};

const keyPageComp = compose(
  connect(
    (state, { match: { params }, history: { location: { query = { } } } }) => ({
      selectedKey: state.selectedKey,
      configKey: params.splat,
      isInAddMode: params.splat === BLANK_KEY_NAME,
      revision: query.revision,
    }),
    { ...selectedKeyActions, ...alertActions },
  ),
  routeLeaveHook(onRouteLeaveConfirmFunc, 'You have unsaved changes, are you sure you want to leave this page?'),
  lifecycle({
    componentDidMount() {
      const { configKey, selectedKey, openKey, revision } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey, { revision });
    },
    componentWillReceiveProps({ configKey, revision }) {
      const { openKey } = this.props;
      if (configKey !== this.props.configKey || revision !== this.props.revision) {
        openKey(configKey, { revision });
      }
    },
  }),
)(({ showCustomAlert, showAlert, showConfirm, ...props }) => {
  const { selectedKey } = props;
  const alerter = {
    showCustomAlert,
    showAlert,
    showConfirm,
  };
  if (!selectedKey || !selectedKey.isLoaded) {
    return <MessageKeyPage message="Loading..." />;
  }

  const { keyDef } = selectedKey.local;
  return !keyDef
    ? <MessageKeyPage message="None existent key" />
    : <KeyEditPage {...props} alerter={alerter} />;
});

export default keyPageComp;
