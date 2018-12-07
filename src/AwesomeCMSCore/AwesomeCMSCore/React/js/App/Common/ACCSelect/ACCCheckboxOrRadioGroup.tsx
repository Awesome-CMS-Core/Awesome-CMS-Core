import React from "react";

type ACCCheckboxOrRadioGroupProps = {
  type: "checkbox" | "radio",
  name: string,
  options: any[],
  selectedOptions?: any[],
  onChange: (...args: any[]) => any
};

const ACCCheckboxOrRadioGroup: React.SFC<ACCCheckboxOrRadioGroupProps> = props => {
  return (
    <div>
      <div className="checkbox-group">
        {props.options.map((option, index) => {
          const styleClass =
            index % 2 === 0
              ? `form-group custom-${props.type} card-split alignleft`
              : `form-group custom--${props.type} card-split alignright`;
          return (
            <div key={option} className={styleClass}>
              <div className={`custom-control custom-${props.type}`}>
                <input
                  className="custom-control-input"
                  name={props.name}
                  onChange={props.onChange}
                  value={option}
                  checked={props.selectedOptions.indexOf(option) > -1}
                  type={props.type}
                  id={option}
                />
                <label className="custom-control-label" htmlFor={option}>
                  {option}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ACCCheckboxOrRadioGroup;
