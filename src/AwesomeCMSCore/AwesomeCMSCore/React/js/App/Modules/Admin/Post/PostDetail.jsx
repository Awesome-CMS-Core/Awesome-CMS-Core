import React, {Component} from "react";
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
import statusCode from '../../../Helper/StatusCode';
import {SAVE_POST_API} from '../../../Helper/API_Endpoint/PostEndpoint';
import {PostWithSpinner} from '../../../Helper/Http';
import {shouldMarkError, validateInput, isFormValid} from '../../../Helper/Validation';
import {onChange, onBlur, handleOnChange} from '../../../Helper/StateHelper';
import {GET_POSTS_API} from '../../../Helper/API_Endpoint/PostEndpoint';
import {Get} from './../../../Helper/Http';

import ACCEditor from '../../../Common/ACCInput/ACCEditor.jsx';
import ACCButton from "../../../Common/ACCButton/ACCButton.jsx";
import ACCInput from "../../../Common/ACCInput/ACCInput.jsx";
import ACCReactSelect from '../../../Common/ACCSelect/ACCReactSelect.jsx';

class PostDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postContent: "",
            title: "",
            shortDescription: "",
            value: [],
            tagOptions: [],
            loading: false,
            touched: {
                title: false,
                shortDescription: false
            },
            postId: "",
            post: null
        },
        this.validationArr = [];
    }

    componentDidMount() {
        const url = `${GET_POSTS_API}/${this.props.postId}`;
        Get(url).then(res => {
            this.setState({post: res.data, value: res.data.tagOptions
                ? JSON.parse(res.data.tagOptions) : []});
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.postId !== nextProps.postId) {
            const url = `${GET_POSTS_API}/${nextProps.postId}`;
            Get(url).then(res => {
                this.setState({post: res.data});
            });
        }
    }

    newPost = e => {
        if (!isFormValid(this.validationArr)) {
            return;
        }

        e.preventDefault();

        PostWithSpinner
            .call(this, SAVE_POST_API, {
            Title: this.state.title,
            ShortDescription: this.state.shortDescription,
            Content: this.state.postContent,
            TagOptions: JSON.stringify(this.state.value)
        })
            .then(res => {
                if (res.status === statusCode.Success) 
                    return toastr.success("Create new post success");
                }
            )
    }

    handleEditorChange = (e) => {
        this.setState({
            postContent: e
                .target
                .getContent()
        });
    }

    onNavigateBack = () => {
        this
            .props
            .onNavigateBack();
    }

    render() {
        const {shortDescription, title, loading, value, tagOptions, post} = this.state;
        this.validationArr = [
            {
                title,
                shortDescription
            }
        ];

        const errors = validateInput.call(this, this.validationArr);

        return (
            <Container
                className={this.props.visible
                ? 'visiblity'
                : 'hidden'}>
                <div id="postContainer">
                    <form onSubmit={this.newPost}>
                        <Row>
                            <Col md="9">
                                <Row>
                                    <Col md="12">
                                        <ACCInput
                                            className={shouldMarkError.call(this, "title", errors)}
                                            type="text"
                                            name="title"
                                            id="title"
                                            placeholder="Title"
                                            required="required"
                                            value={post ? post.title : title}
                                            onChange={title => onChange.call(this, title)}
                                            onBlur={title => onBlur.call(this, title)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <ACCInput
                                            className={shouldMarkError.call(this, "shortDescription", errors)}
                                            type="text"
                                            name="shortDescription"
                                            id="shortDescription"
                                            placeholder="Short Description"
                                            required="required"
                                            value={post ? post.shortDescription : shortDescription}
                                            onChange={shortDescription => onChange.call(this, shortDescription)}
                                            onBlur={shortDescription => onBlur.call(this, shortDescription)}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <ACCEditor onChange={this.handleEditorChange} value={post ? post.content : null}/>
                                    </Col>
                                </Row>
                                <Row className="postFooter">
                                    <Col md="12">
                                        <ACCButton
                                            validationArr={this.validationArr}
                                            loading={loading}
                                            btnBlocked="btn-block"
                                            label="Save post"/>
                                    </Col>
                                </Row>
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
                                    <Button onClick={this.onNavigateBack}>
                                        Back</Button>
                                </Card>
                            </Col>
                        </Row>
                    </form>
                </div>
            </Container>
        );
    }
}

PostDetail.propTypes = {
    visible: PropTypes.bool,
    onNavigateBack: PropTypes.func,
    postId: PropTypes.number
};

export default PostDetail;