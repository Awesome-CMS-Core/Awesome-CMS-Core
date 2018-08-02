import React, {Component} from 'react';
import {render} from "react-dom";
import {
    Container,
    Row,
    Col,
    ListGroup,
    ListGroupItem,
    Badge,
    Card,
    Button,
    CardTitle,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import classnames from 'classnames';
import moment from 'moment/src/moment';

import {Get} from '../../../Helper/Http';
import {isDomExist, navigateToUrl} from "../../../Helper/Util";
import {isEmptyString} from '../../../Helper/Validation';
import {GET_POSTS_API} from '../../../Helper/API_Endpoint/PostEndpoint';
import PostDetail from './PostDetail.jsx';

class PostContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: null,
            visible: false,
            postId: null,
            activeTab: 'Published'
        }
    }

    componentDidMount() {
        Get(GET_POSTS_API).then(res => {
            this.setState({posts: res.data});
        });
    }

    navigateToPostDetail(postId) {
        if (!isEmptyString(postId)) {
            this.setState({visible: true});
            this.setState({postId});
        }
    }

    onNavigateBack = () => {
        this.setState({visible: false});
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({activeTab: tab});
        }
    }

    renderPost() {
        return this
            .state
            .posts
            .map(post => {
                return (
                    <ListGroupItem
                        key={post.id}
                        className="postItem"
                        tag="a"
                        onClick={() => this.navigateToPostDetail(post.id)}
                        action>
                        <h3>{post.title}</h3>
                        <h6>{moment(post.dateCreated).format('DD MMMM YYYY')}</h6>
                    </ListGroupItem>
                )
            });
    }

    render() {
        const {visible, postId, posts} = this.state;

        return (posts
            ? <div>
                    <Container
                        className={!visible
                        ? 'visiblity'
                        : 'hidden'}>
                        <Row>
                            <Col md="9">
                                <ListGroup>
                                    <ListGroupItem tag="a" href="#" action id="postHeaderSection">
                                        <div>
                                            <Nav tabs>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({
                                                        active: this.state.activeTab === 'Published'
                                                    })}
                                                        onClick={() => {
                                                        this.toggle('Published');
                                                    }}>
                                                        Published &nbsp;
                                                        <Badge color="secondary">{posts.numberOfPostPublished}</Badge>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({
                                                        active: this.state.activeTab === 'Drafted'
                                                    })}
                                                        onClick={() => {
                                                        this.toggle('Drafted');
                                                    }}>
                                                        Drafted &nbsp;
                                                        <Badge color="secondary">{posts.numberOfDraftedPost}</Badge>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        className={classnames({
                                                        active: this.state.activeTab === 'Deleted'
                                                    })}
                                                        onClick={() => {
                                                        this.toggle('Deleted');
                                                    }}>
                                                        Deleted &nbsp;
                                                        <Badge color="secondary">{posts.numberOfDeletedPost}</Badge>
                                                    </NavLink>
                                                </NavItem>
                                            </Nav>
                                            <TabContent activeTab={this.state.activeTab}>
                                                <TabPane tabId="Published" className="postsTabWrapper">
                                                    <Row>
                                                        <Col sm="12">
                                                            {posts
                                                                .postsPublished
                                                                .map(post => {
                                                                    return (
                                                                        <ListGroupItem
                                                                            key={post.id}
                                                                            className="postItem"
                                                                            tag="a"
                                                                            onClick={() => this.navigateToPostDetail(post.id)}
                                                                            action>
                                                                            <h3>{post.title}</h3>
                                                                            <h6>{moment(post.dateCreated).format('DD MMMM YYYY')}</h6>
                                                                        </ListGroupItem>
                                                                    )
                                                                })}
                                                        </Col>
                                                    </Row>
                                                </TabPane>
                                                <TabPane tabId="Drafted" className="postsTabWrapper">
                                                    <Row>
                                                        <Col sm="12">
                                                            {posts
                                                                .postsDrafted
                                                                .map(post => {
                                                                    return (
                                                                        <ListGroupItem
                                                                            key={post.id}
                                                                            className="postItem"
                                                                            tag="a"
                                                                            onClick={() => this.navigateToPostDetail(post.id)}
                                                                            action>
                                                                            <h3>{post.title}</h3>
                                                                            <h6>{moment(post.dateCreated).format('DD MMMM YYYY')}</h6>
                                                                        </ListGroupItem>
                                                                    )
                                                                })}
                                                        </Col>
                                                    </Row>
                                                </TabPane>
                                                <TabPane tabId="Deleted" className="postsTabWrapper">
                                                    <Row>
                                                        <Col sm="12">
                                                            {posts
                                                                .postDeleted
                                                                .map(post => {
                                                                    return (
                                                                        <ListGroupItem
                                                                            key={post.id}
                                                                            className="postItem"
                                                                            tag="a"
                                                                            onClick={() => this.navigateToPostDetail(post.id)}
                                                                            action>
                                                                            <h3>{post.title}</h3>
                                                                            <h6>{moment(post.dateCreated).format('DD MMMM YYYY')}</h6>
                                                                        </ListGroupItem>
                                                                    )
                                                                })}
                                                        </Col>
                                                    </Row>
                                                </TabPane>
                                            </TabContent>
                                        </div>
                                    </ListGroupItem>
                                </ListGroup>
                            </Col>
                            <Col md="3">
                                <Card body>
                                    <CardTitle>Management</CardTitle>
                                    <Button onClick={() => navigateToUrl('/Post/NewPost')}>
                                        <i className="fa fa-newspaper-o" aria-hidden="true"></i>
                                        &nbsp; New post
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                    {postId
                        ? <PostDetail
                                visible={visible}
                                onNavigateBack={this.onNavigateBack}
                                postId={postId}/>
                        : null}
                </div>
            : null)
    }
}

PostContainer.propTypes = {}

export default PostContainer;

if (isDomExist("postList")) {
    render(
        <PostContainer/>, document.getElementById("postList"));
}