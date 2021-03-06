import React from 'react';
import MultiSourceComboBox from '../../../../common/ComboBox/MultiSourceComboBox';
import * as ContextService from '../../../../../services/context-service';
import * as SearchService from '../../../../../services/search-service';
import Avatar from './Avatar';
import PropertySuggestion from './PropertySuggestion';
import './styles.css';

const getProperty = (suggestedValues, property) => {
  const result = suggestedValues.find(x => x.value === property);
  return result ? result.label : property;
};

const PropertyComboBox = ({ property, suggestedValues, onPropertyChange, autofocus }) => {
  property = property.replace(/^@@key:/, ContextService.KEYS_IDENTITY);
  const [identity] = property.split('.');

  return (
    <div className="property-combobox-container">
      <Avatar identity={identity} className="property-avatar" />
      <MultiSourceComboBox
        getSuggestions={{
          Context: () => suggestedValues,
          Keys: (query) => {
            const search = query.startsWith(ContextService.KEYS_IDENTITY)
              ? query.substring(ContextService.KEYS_IDENTITY.length)
              : query;
            return SearchService.getSuggestions(search).then(suggestions =>
              suggestions.map(label => ({
                label,
                value: `${ContextService.KEYS_IDENTITY}${label}`,
              })),
            );
          },
        }}
        value={getProperty(suggestedValues, property)}
        onChange={(input, selected) => {
          if (selected) onPropertyChange(selected);
          else if (input.startsWith('@@key:') || input.startsWith(ContextService.KEYS_IDENTITY)) {
            onPropertyChange({ value: input.replace('@@key:', ContextService.KEYS_IDENTITY) });
          }
        }}
        placeholder="Property"
        filterBy={(currentInputValue, option) =>
          option.value.toLowerCase().includes(currentInputValue.toLowerCase())}
        renderSuggestion={(suggestion, currentInputValue) =>
          <PropertySuggestion suggestion={suggestion} textToMark={currentInputValue} />}
        autofocus={autofocus}
        className={'property-name-wrapper'}
        showValueInOptions
      />
    </div>
  );
};

export default PropertyComboBox;
