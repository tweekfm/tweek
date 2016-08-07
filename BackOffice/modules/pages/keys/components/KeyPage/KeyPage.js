import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import KeyRulesEditor from '../KeyRulesEditor/KeyRulesEditor';
import * as keysActions from '../../ducks/selectedKey';
import * as tagActions from '../../ducks/tags';
import style from './KeyPage.css';
import { diff } from 'deep-diff';
import { WithContext as ReactTags } from 'react-tag-input';
import R from 'ramda';
import TextareaAutosize from 'react-autosize-textarea';

export default connect((state, { params }) => (
  { selectedKey: state.selectedKey, tags: state.tags, configKey: params.splat }),
  { ...keysActions, ...tagActions })(
  class KeyPage extends Component {

    static propTypes = {
      dispatch: React.PropTypes.func,
      configKey: React.PropTypes.string,
      selectedKey: React.PropTypes.object,
    }

    constructor(props) {
      super(props);

      this.state = {
        isDisplayNameInEditMode: false,
      };
    }

    componentDidMount() {
      const { downloadKey, configKey, selectedKey, downloadTags } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      downloadKey(configKey);
      downloadTags();
    }

    componentWillReceiveProps({ configKey }) {
      const { downloadKey, selectedKey, downloadTags } = this.props;
      if (configKey !== this.props.configKey || !selectedKey) {
        downloadKey(configKey);
        downloadTags();
      }
    }

    onDisplayNameChanged(newDisplayName) {
      const newMeta = { ...this.props.selectedKey.local.meta, displayName: newDisplayName };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onDescriptionChanged(newDescription) {
      const newMeta = { ...this.props.selectedKey.local.meta, description: newDescription };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onTagDeleted(deletedTagIndex) {
      const meta = this.props.selectedKey.local.meta;
      const newMeta = { ...meta, tags: R.remove(deletedTagIndex, 1, meta.tags) };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onTagAdded(newTagText) {
      const meta = this.props.selectedKey.local.meta;
      const newMeta = { ...meta, tags: [...meta.tags, newTagText] };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    get tags() {
      return R.map(_ => ({
        id: _,
        text: _,
      }), this.props.selectedKey.local.meta.tags);
    }

    get tagsSuggestions() {
      return this.props.tags ? this.props.tags.map(tag => tag.name) : [];
    }

    _onSelectedKeyMetaChanged(newMeta) {
      this.props.updateKeyMetaDef(newMeta);
    }

    renderSaveButton() {
      let { local, remote, isSaving } = this.props.selectedKey;
      const changes = diff(local, remote);
      const hasChanges = (changes || []).length > 0;
      return (<button disabled={!hasChanges || isSaving }
        data-state-has-changes={hasChanges}
        data-state-is-saving={isSaving}
        className={style['save-button']}
        onClick={() => this.props.saveKey(this.props.configKey) }
      >
    {isSaving ? 'Saving...' : 'Save changes'}
  </button>);
    }

    render() {
      const { dispatch, configKey, selectedKey } = this.props;
      if (!selectedKey) return <div>loading</div>;
      const { meta, ruleDef } = selectedKey.local;

      return (<div className={style['key-viewer-container']}>
    {this.renderSaveButton() }
    <div className={style['key-header']}>

      <div className={style['display-name-wrapper']}>
        {this.state.isDisplayNameInEditMode ?

          <form onSubmit={ (e) => { this.setState({ isDisplayNameInEditMode: false }); e.preventDefault(); } }>
            <input type="text"
              ref={(input) => input && input.focus() }
              className={style['display-name-input']}
              onChange={ (e) => this.onDisplayNameChanged(e.target.value) }
              value = { meta.displayName }
              onBlur={() => { this.setState({ isDisplayNameInEditMode: false }); } }
            />
          </form>
          :
          <div className={style['display-name']}
            onClick={() => {
              this.setState({ isDisplayNameInEditMode: true });
            } }
          >
            {meta.displayName}
          </div>
        }
      </div>

      <div className={style['full-key-path-wrapper']}>
        <label>Full path: </label>
        <label className={style['actual-path']}>{configKey}</label>
      </div>

      <TextareaAutosize
        onChange={ (e) => this.onDescriptionChanged(e.target.value) }
        value = { meta.description }
        placeholder="Description"
        className={style['description-input']}
      />

      <ReactTags tags={ this.tags }
        handleDelete={ this:: this.onTagDeleted }
        handleAddition={ this:: this.onTagAdded }
        suggestions={this.tagsSuggestions }
        placeholder="New tag"
        minQueryLength={ 1 }
        allowDeleteFromEmptyInput={ false }
        classNames={{
          tags: style['tags-container'],
          tagInput: style['tag-input'],
          tag: style['tag'],
          remove: style['tag-delete-button'],
          suggestions: style['tags-suggestion'],
        } }
      />

    </div>

    <KeyRulesEditor ruleDef={ruleDef}
      sourceTree={JSON.parse(ruleDef.source) }
      onMutation={x => this.props.updateKeyRuleDef({ source: JSON.stringify(x, null, 4) }) }
      className={style['key-rules-editor']}
    />
  </div>);
    }
  });