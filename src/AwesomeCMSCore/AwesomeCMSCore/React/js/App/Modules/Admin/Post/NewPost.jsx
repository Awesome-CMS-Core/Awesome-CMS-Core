import React, {Component} from "react";
import {render} from "react-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    CardTitle
} from 'reactstrap';
import toastr from "toastr";
import PropTypes from "prop-types";
import {STATUS_CODE, POST_STATUS} from "../../../Helper/AppEnum";
import {SAVE_POST_API} from '../../../Helper/API_Endpoint/PostEndpoint';
import {PostWithSpinner} from '../../../Helper/Http';
import {isDomExist} from "../../../Helper/Util";
import {onChange, onBlur, handleOnChange} from '../../../Helper/StateHelper';

import ACCEditor from '../../../Common/ACCInput/ACCEditor.jsx';
import ACCButton from "../../../Common/ACCButton/ACCButton.jsx";
import ACCInput from "../../../Common/ACCInput/ACCInput.jsx";
import ACCReactSelect from '../../../Common/ACCSelect/ACCReactSelect.jsx';
import Spinner from '../../../Common/ACCAnimation/Spinner.jsx';

class NewPost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postContent: "",
            title: "",
            shortDescription: "",
            value: [],
            tagOptions: [],
            loading: false
        }
    }

    newPost = (e, postStatus) => {
        e.preventDefault();

        PostWithSpinner.call(this, SAVE_POST_API, {
            Title: this.state.title,
            ShortDescription: this.state.shortDescription,
            Content: this.state.postContent,
            TagData: JSON.stringify(this.state.value.map(x => x.value)),
            TagOptions: JSON.stringify(this.state.value),
            PostStatus: postStatus
        }).then(res => {
            if (res.status === STATUS_CODE.Success) 
                return toastr.success("Create new post success");
            }
        );
    }

    handleEditorChange = (e) => {
        this.setState({
            postContent: e
                .target
                .getContent()
        });
    }

    render() {
        const {
            shortDescription,
            title,
            disabled,
            loading,
            value,
            tagOptions
        } = this.state;

        return (
            <Container>
                <div id="postContainer">
                    <form>
                        <Row>
                            <Col md="9">
                                <Row>
                                    <Col md="12">
                                        <ACCInput
                                            type="text"
                                            name="title"
                                            id="title"
                                            placeholder="Title"
                                            required="required"
                                            value={title}
                                            onChange={title => onChange.call(this, title)}
                                            onBlur={title => onBlur.call(this, title)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <ACCInput
                                            type="text"
                                            name="shortDescription"
                                            id="shortDescription"
                                            placeholder="Short Description"
                                            required="required"
                                            value={shortDescription}
                                            onChange={shortDescription => onChange.call(this, shortDescription)}
                                            onBlur={shortDescription => onBlur.call(this, shortDescription)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <ACCEditor onChange={this.handleEditorChange}/>
                                    </Col>
                                </Row>
                                <Row className="postFooter"></Row>
                            </Col>
                            <Col md="3">
                                <Card body>
                                    <CardTitle>Post Options</CardTitle>
                                    <ACCReactSelect
                                        {...tagOptions}
                                        value={value}
                                        placeholder="Post tag"
                                        handleOnChange={value => handleOnChange.call(this, value)}/>
                                    <br/>
                                    <Button onClick={() => window.history.go(-1)}>
                                        Back</Button>
                                    <br/> {!loading
                                        ? <div>
                                                <ACCButton
                                                    disabled={disabled}
                                                    label="Save as Drafted"
                                                    btnBlocked
                                                    onClick={e => this.newPost(e, POST_STATUS.Draft)}/>
                                                <br/>
                                                <ACCButton
                                                    disabled={disabled}
                                                    label="Published Post"
                                                    btnBlocked
                                                    onClick={e => this.newPost(e, POST_STATUS.Published)}/>
                                            </div>
                                        : <Spinner/>}
                                </Card>
                            </Col>
                        </Row>
                    </form>
                </div>
            </Container>
        );
    }
}

NewPost.propTypes = {
    visible: PropTypes.bool
};

if (isDomExist("newPostContent")) {
    render(
        <NewPost/>, document.getElementById("newPostContent"));
}