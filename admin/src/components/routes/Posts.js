// Dependencies
import { useDispatch, useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';
import Post from 'components/partials/Post';

// Actions
import { createPost } from 'actions/PostsActions';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

const Posts = () => {

  const dispatch = useDispatch();

  // Redux store
  const posts = useSelector(state => state.posts)

  const saveFileContent = (fileContent, latest = true) => {
    const filename = latest ? "latest.json" : 'all.json';
    if (latest) {
      fileContent = fileContent.slice(0, 3);
    }
    const contentString = JSON.stringify(fileContent);
    const blob = new Blob([contentString], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, filename);
  }

  const createPostInStore = () => {
    dispatch(createPost(posts));
  }


  const renderPostsFields = () => {
    return posts && posts.length
      ? posts.map((post, index) => {
        return (
          <Post postData={post} index={index} key={`post-${post.id}${index}`} />
        )
      }) : '';
  }

  return (
    <div className={style.contentSection}>
      <h1>Posts</h1>
      {renderPostsFields()}
      <ActionButtonBar>
        <button onClick={createPostInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
        <button onClick={() => saveFileContent(posts, true)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> Latest</button>
        <button onClick={() => saveFileContent(posts, false)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> All</button>
      </ActionButtonBar>
    </div>
  )
}

export default Posts;
