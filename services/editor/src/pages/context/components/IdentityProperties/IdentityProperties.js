import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import Input from '../../../../components/common/Input/Input';
import TypedInput from '../../../../components/common/Input/TypedInput';
import { getContextProperties, getPropertyTypeDetails } from '../../../../services/context-service';
import './IdentityProperties.css';

const getPropertyValueType = (identityName, property) => {
  const details = getPropertyTypeDetails(`${identityName}.${property}`);
  return 'name' in details ? details.name : details;
};

const Property = ({ identityName, property, value }) =>
  <div className="property-wrapper" data-comp="identity-property">
    <Input className="property-input" data-comp="property" value={property} disabled />
    <TypedInput
      className="property-input"
      data-comp="value"
      value={value}
      valueType={getPropertyValueType(identityName, property)}
      placeholder="(no value)"
      disabled
    />
  </div>;

const IdentityProperties = ({ className, identityName, properties }) =>
  <div
    className={classnames('context-properties-container', className)}
    data-comp="identity-properties"
  >
    <div className="context-properties-title">Properties</div>
    <div className="property-list">
      {Object.keys(properties).map(prop =>
        <Property
          key={prop}
          identityName={identityName}
          property={prop}
          value={properties[prop]}
        />,
      )}
    </div>
  </div>;

export default compose(
  connect(state => state.context),
  mapProps(({ remote: context, ...props, identityName }) => ({
    properties: getContextProperties(identityName, context),
    ...props,
  })),
)(IdentityProperties);
