// Dependencies
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


// Actions
import { updatePosts } from 'actions/PostsActions';

// Helpers
import { getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


const Post = ({ postData, index }) => {

    const dispatch = useDispatch();

    // Redux store
    const posts = useSelector(state => state.posts)

    // State
    const [post, setPost] = useState();

    useEffect(() => {
        setPost(postData);
    }, [postData]);

    const handleOrderNumberChange = (orderNumber) => {
        const date = new Date(post.timestamp);
        const orderNumberString = getOrderNumberString(orderNumber);
        const thumbnailFilename = getGeneratedFilenameByDate(date, orderNumberString);
        const id = getGeneratedIdByDate(date, orderNumberString);
        setPost({
            ...post,
            orderNumber: parseInt(orderNumber),
            thumbnailFilename,
            id
        })
    }

    const handleTimestampChange = (value) => {
        const orderNumberString = getOrderNumberString(post.orderNumber);
        const thumbnailFilename = getGeneratedFilenameByDate(value, orderNumberString);
        const id = getGeneratedIdByDate(value, orderNumberString);
        setPost({
            ...post,
            timestamp: value.valueOf(),
            thumbnailFilename,
            id
        });
    }

    const handleTitleChange = (value, language) => {
        setPost({
            ...post,
            title: {
                ...post.title,
                [language]: value
            }
        });
    }

    const handleContentChange = (value, language) => {
        setPost({
            ...post,
            content: {
                ...post.content,
                [language]: value
            }
        });
    }

    const handleThumbnailDescriptionChange = (thumbnailDescription) => {
        setPost({
            ...post,
            thumbnailDescription
        });
    }

    const handleCopyrightChange = (copyright) => {
        setPost({
            ...post,
            copyright
        });
    }

    const handleLinkInternalChange = (internal) => {
        setPost({
            ...post,
            link: {
                ...post.link,
                internal,
                url: internal ? { en: '', no: '' } : ''
            }
        });
    }

    const handleLinkUrlChange = (url, language) => {
        setPost({
            ...post,
            link: {
                ...post.link,
                url: language?.length
                    ? {
                        ...post.link.url,
                        [language]: url
                    }
                    : url
            }
        });
    }

    const handleLinkTextChange = (text, language) => {
        setPost({
            ...post,
            link: {
                ...post.link,
                text: {
                    ...post.link.text,
                    [language]: text
                }
            }
        });
    }

    const addLink = () => {
        setPost({
            ...post,
            link: {
                url: '',
                text: {
                    en: '',
                    no: ''
                }
            }
        });
    }

    const removeLink = () => {
        let newPost = { ...post };
        delete newPost.link;
        setPost(newPost);
    }

    const updatePostsInStore = () => {
        let newPosts = posts;
        newPosts[index] = post;
        dispatch(updatePosts(newPosts));
    }

    return post && Object.keys(post).length
        ? (
            <div key={index} className={commonStyle.formListElement}>
                <span className={commonStyle.formElementGroupTitle}>Identifiers</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`timestamp-${index}`}>
                        Timestamp
                        <DatePicker
                            id={`timestamp-${index}`}
                            locale="nb"
                            onChange={event => handleTimestampChange(event)}
                            onBlur={updatePostsInStore}
                            selected={post.timestamp}
                            className={commonStyle.input} />
                    </label>
                    <label htmlFor={`orderNumber-${index}`}>
                        Order no.
                        <input type="number" id={`orderNumber-${index}`} min="0" value={post.orderNumber ? post.orderNumber : 0} onChange={event => handleOrderNumberChange(event.target.value)} />
                    </label>
                    <label htmlFor={`id-${index}`}>
                        ID
                        <span id={`id-${index}`}>
                            {post.id}
                        </span>
                    </label>
                    <label htmlFor={`thumbnailFilename-${index}`}>
                        Image filename
                        <span id={`thumbnailFilename-${index}`}>
                            {post.thumbnailFilename}_[filesize].[filetype]
                        </span>
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>Title</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`title-no-${index}`}>
                        Norwegian
                        <input type="text" id={`title-no-${index}`} value={post.title.no} onChange={event => handleTitleChange(event.target.value, 'no')} onBlur={updatePostsInStore} />
                    </label>
                    <label htmlFor={`title-en-${index}`}>
                        English
                        <input type="text" id={`title-en-${index}`} value={post.title.en} onChange={event => handleTitleChange(event.target.value, 'en')} onBlur={updatePostsInStore} />
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>Content</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`content-no-${index}`}>
                        Norwegian
                        <textarea id={`content-no-${index}`} value={post.content.no} onChange={event => handleContentChange(event.target.value, 'no')} onBlur={updatePostsInStore}></textarea>
                    </label>
                    <label htmlFor={`content-en-${index}`}>
                        English
                        <textarea id={`content-en-${index}`} value={post.content.en} onChange={event => handleContentChange(event.target.value, 'en')} onBlur={updatePostsInStore}></textarea>
                    </label>
                </div>


                <span className={commonStyle.formElementGroupTitle}>Image</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`thumbnailDescription-${index}`}>
                        Image description
                        <input type="text" id={`thumbnailDescription-${index}`} value={post.thumbnailDescription} onChange={event => handleThumbnailDescriptionChange(event.target.value)} onBlur={updatePostsInStore} />
                    </label>
                    <label htmlFor={`copyright-${index}`}>
                        Image copyright
                        <input type="checkbox" id={`copyright-${index}`} checked={post.copyright ? true : false} onChange={event => handleCopyrightChange(event.target.checked)} onBlur={updatePostsInStore} />
                    </label>
                </div>

                {
                    post.link && Object.keys(post.link).length
                        ? (
                            <React.Fragment>
                                <span className={commonStyle.formElementGroupTitle}>Link</span>
                                <div className={commonStyle.formElement}>
                                    <label htmlFor={`link-internal-${index}`} style={{ width: '100px' }}>
                                        Internal
                                        <input type="checkbox" id={`link-internal-${index}`} checked={post.link.internal ? true : false} onChange={event => handleLinkInternalChange(event.target.checked)} onBlur={updatePostsInStore} />
                                    </label>
                                    {
                                        post.link.internal
                                            ? (
                                                <React.Fragment>
                                                    <label htmlFor={`link-url-no-${index}`}>
                                                        Norwegian URL
                                                        <input type="text" id={`link-url-no-${index}`} value={post.link.url.no} onChange={event => handleLinkUrlChange(event.target.value, 'no')} onBlur={updatePostsInStore} />
                                                    </label>
                                                    <label htmlFor={`link-url-en-${index}`}>
                                                        English URL
                                                        <input type="text" id={`link-url-en-${index}`} value={post.link.url.en} onChange={event => handleLinkUrlChange(event.target.value, 'en')} onBlur={updatePostsInStore} />
                                                    </label>
                                                </React.Fragment>)
                                            : (
                                                <React.Fragment>
                                                    <label htmlFor={`link-url-${index}`}>
                                                        URL
                                                        <input type="text" id={`link-url-${index}`} value={post.link.url} onChange={event => handleLinkUrlChange(event.target.value)} onBlur={updatePostsInStore} />
                                                    </label>
                                                </React.Fragment>)
                                    }
                                </div>
                                <div className={commonStyle.formElement}>
                                    <label htmlFor={`link-text-no-${index}`}>
                                        Norwegian link text
                                        <input type="text" id={`link-text-no-${index}`} value={post.link.text.no} onChange={event => handleLinkTextChange(event.target.value, 'no')} onBlur={updatePostsInStore} />
                                    </label>
                                    <label htmlFor={`link-text-en-${index}`}>
                                        English link text
                                        <input type="text" id={`link-text-en-${index}`} value={post.link.text.en} onChange={event => handleLinkTextChange(event.target.value, 'en')} onBlur={updatePostsInStore} />
                                    </label>
                                </div>

                            </React.Fragment>)
                        : ''
                }
                <div className={commonStyle.buttonBar}>
                    {
                        post.link && Object.keys(post.link).length
                            ? (<button className={commonStyle.bgRed} onClick={() => removeLink()}><FontAwesomeIcon icon={['fas', 'unlink']} /></button>)
                            : (<button className={commonStyle.bgGreen} onClick={() => addLink()}><FontAwesomeIcon icon={['fas', 'link']} /></button>)
                    }
                </div>
            </div>
        ) : ''
}


export default Post;
