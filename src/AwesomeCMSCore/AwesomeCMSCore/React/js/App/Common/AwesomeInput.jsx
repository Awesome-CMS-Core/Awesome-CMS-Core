import React from "react";
import PropTypes from "prop-types";

const AwesomeInput = ({ ...props }) => {
  let className = "";

  if (props.required) {
    !props.value.toString().trim().length
      ? (className = "form-control is-invalid")
      : (className = "form-control");
  }

  return (
    <div>
      <input
        className={className}
        id={props.id}
        type={props.type || "text"}
        name={props.name}
        placeholder={props.placeholder}
        onChange={props.onChange}
        onBlur={props.onBlur}
        value={props.value}
        required={props.required}
      />
    </div>
  );
};

AwesomeInput.propTypes = {
  className: PropTypes.bool,
  id: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  required: PropTypes.string
};

export default AwesomeInput;