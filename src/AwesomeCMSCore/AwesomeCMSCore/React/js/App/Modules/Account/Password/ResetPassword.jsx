import React, {Component} from "react";
import {render} from "react-dom";
import toastr from "toastr";

import {getAllUrlParams} from '../../../Helper/QueryStringParser';
import {onChange, onBlur} from "../../../Helper/StateHelper";
import {navigateToUrl, isDomExist} from "../../../Helper/Util";
import {shouldMarkError, validateInput, isFormValid} from "../../../Helper/Validation";
import {PostWithSpinner} from "../../../Helper/Http";
import env from "../../../Helper/Enviroment";
import statusCode from "../../../Helper/StatusCode";

import ACCInput from "../../../Common/ACCInput/ACCInput.jsx";
import ACCButton from "../../../Common/ACCButton/ACCButton.jsx";

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            token: "",
            loading: false,
            showSuccessMessage: false,
            touched: {
                password: false
            }
        }

        this.validationArr = [];
    }

    componentWillMount() {
        const email = getAllUrlParams().email;
        const token = decodeURIComponent(getAllUrlParams().token);
        this.setState({email, token});
    }

    resetPassword = e => {
        if (!isFormValid(this.validationArr)) {
            return;
        }

        e.preventDefault();

        PostWithSpinner
            .call(this, env.resetPassword, {
            Email: this.state.email,
            Token: this.state.token,
            Password: this.state.password
        })
            .then((res) => {
                if (res.status === statusCode.Success) {
                    this.setState({showSuccessMessage: true})
                    window.setTimeout(navigateToUrl(env.login), 5000);
                }
            })
            .catch((err) => {
                switch (err.response.status) {
                    case statusCode.ResetPassTokenExpire:
                        return toastr.warning("Your reset password token is invalid. Please check email again");
                }
            });
    }

    render() {
        const {password, loading, showSuccessMessage} = this.state;
        this.validationArr = [
            {
                password: password
            }
        ];

        const errors = validateInput.call(this, this.validationArr);

        return (
            <div id="resetPasswordContainer">
                <div className="card">
                    <div className="card-header text-center">
                        Reset Password
                    </div>
                    <div className="card-body">
                        <form onSubmit={this.resetPassword}>
                            <div id="resetPasswordFormContent">
                                {showSuccessMessage
                                    ? <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                            You can now login using your new password
                                        </div>
                                    : null}
                                <ACCInput
                                    className={shouldMarkError.call(this, "password", errors)}
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    required="required"
                                    value={password}
                                    onChange={password => onChange.call(this, password)}
                                    onBlur={password => onBlur.call(this, password)}/>
                                <ACCButton
                                    validationArr={this.validationArr}
                                    loading={loading}
                                    btnBlocked="btn-block"
                                    label="Reset Password"/>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

if (isDomExist("resetPasswordForm")) {
    render(
        <ResetPassword/>, document.getElementById("resetPasswordForm"));
}

export default ResetPassword;