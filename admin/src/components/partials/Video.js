// Dependencies
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


// Actions
import { updateVideos } from 'actions/VideosActions';

// Helpers
import { getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";


registerLocale('nb', nb)


const Video = ({ videoData, index }) => {


    const dispatch = useDispatch();

    // Redux store
    const videos = useSelector(state => state.videos)

    // State
    const [video, setVideo] = useState();

    useEffect(() => {
        setVideo(videoData);
    }, [videoData]);



    const handleOrderNumberChange = (orderNumber) => {
        const date = new Date(video.timestamp);
        const orderNumberString = getOrderNumberString(orderNumber);
        const thumbnailFilename = getGeneratedFilenameByDate(date, orderNumberString);
        const id = getGeneratedIdByDate(date, orderNumberString);
        setVideo({
            ...video,
            orderNumber: parseInt(orderNumber),
            thumbnailFilename,
            id
        });
    }

    const handleTimestampChange = (value) => {
        const orderNumberString = getOrderNumberString(video.orderNumber);
        const thumbnailFilename = getGeneratedFilenameByDate(value, orderNumberString);
        const id = getGeneratedIdByDate(value, orderNumberString);
        setVideo({
            ...video,
            timestamp: value.valueOf(),
            thumbnailFilename,
            id
        });
        updateVideosInStore();
    }

    const handleTitleChange = (value, language) => {
        setVideo({
            ...video,
            title: {
                ...video.title,
                [language]: value
            }
        });
    }

    const handleContentChange = (value, language) => {
        setVideo({
            ...video,
            content: {
                ...video.content,
                [language]: value
            }
        });
    }

    const handleThumbnailDescriptionChange = (thumbnailDescription) => {
        setVideo({
            ...video,
            thumbnailDescription
        });
    }

    const handleCopyrightChange = (copyright) => {
        setVideo({
            ...video,
            copyright
        });
    }

    const handleYouTubeChannelIdChange = (youTubeChannelId) => {
        setVideo({
            ...video,
            youTubeChannelId
        });
    }

    const handleYouTubeUserChange = (youTubeUser) => {
        setVideo({
            ...video,
            youTubeUser
        });
    }

    const handleYouTubeIdChange = (youTubeId) => {
        setVideo({
            ...video,
            youTubeId
        });
    }

    const handleClipsChange = (clips) => {
        setVideo({
            ...video,
            clips
        });
    }

    const getHoursFromDuration = (duration) => {
        const regex = /(\d+)(H)/i;
        const matches = regex.exec(duration);
        return matches && matches[1] ? matches[1] : '';
    }

    const getMinutesFromDuration = (duration) => {
        const regex = /(\d+)(M)/i;
        const matches = regex.exec(duration);
        return matches && matches[1] ? matches[1] : '';
    }

    const getSecondsFromDuration = (duration) => {
        const regex = /(\d+)(S)/i;
        const matches = regex.exec(duration);
        return matches && matches[1] ? matches[1] : '';
    }

    const convertToYoutubeDuration = (hours, minutes, seconds) => {
        hours = hours && hours !== '0' ? `${hours}H` : '';
        minutes = minutes && minutes !== '0' ? `${minutes}M` : '';
        seconds = seconds && seconds !== '0' ? `${seconds}S` : '';
        return `PT${hours}${minutes}${seconds}`;
    }

    const handleDurationHoursChange = (hours) => {
        const minutes = getMinutesFromDuration(video.duration);
        const seconds = getSecondsFromDuration(video.duration);
        const duration = convertToYoutubeDuration(hours, minutes, seconds);
        setVideo({
            ...video,
            duration
        });
    }

    const handleDurationMinutesChange = (minutes) => {
        const hours = getHoursFromDuration(video.duration);
        const seconds = getSecondsFromDuration(video.duration);
        const duration = convertToYoutubeDuration(hours, minutes, seconds);
        setVideo({
            ...video,
            duration
        });
    }

    const handleDurationSecondsChange = (seconds) => {
        const hours = getHoursFromDuration(video.duration);
        const minutes = getMinutesFromDuration(video.duration);
        const duration = convertToYoutubeDuration(hours, minutes, seconds);
        setVideo({
            ...video,
            duration
        });
    }

    const getHoursFromClipOffsetValue = (clipOffsetValue) => {
        return Math.floor(clipOffsetValue / 3600);
    }
    const getMinutesFromClipOffsetValue = (clipOffsetValue) => {
        return Math.floor(clipOffsetValue % 3600 / 60);
    }
    const getSecondsFromClipOffsetValue = (clipOffsetValue) => {
        return Math.floor(clipOffsetValue % 60);
    }

    const getOffsetValueFromDuration = (duration) => {
        const hours = getHoursFromDuration(duration);
        const minutes = getMinutesFromDuration(duration);
        const seconds = getSecondsFromDuration(duration);
        return (hours * 3600) + (minutes * 60) + (seconds * 1);
    }

    const handleClipNameChange = (clipIndex, name, language) => {
        const clips = video.clips;
        clips[clipIndex].name[language] = name;
        setVideo({
            ...video,
            clips
        });
    }

    const handleClipOffsetHoursChange = (clipIndex, hours) => {
        hours = hours ? parseInt(hours) : 0;
        const clips = video.clips;
        const prevStartOffset = clips[clipIndex].startOffset;
        const prevStartOffsetHours = getHoursFromClipOffsetValue(prevStartOffset);
        const newStartOffset = prevStartOffset - (prevStartOffsetHours * 3600) + (hours * 3600);
        clips[clipIndex].startOffset = newStartOffset;
        if (clipIndex > 0) {
            clips[clipIndex - 1].endOffset = newStartOffset;
        }
        setVideo({
            ...video,
            clips
        });
    }

    const handleClipOffsetMinutesChange = (clipIndex, minutes) => {
        minutes = minutes ? parseInt(minutes) : 0;
        const clips = video.clips;
        const prevStartOffset = clips[clipIndex].startOffset;
        const prevStartOffsetMinutes = getMinutesFromClipOffsetValue(prevStartOffset);
        const newStartOffset = prevStartOffset - (prevStartOffsetMinutes * 60) + (minutes * 60);
        clips[clipIndex].startOffset = newStartOffset;
        if (clipIndex > 0) {
            clips[clipIndex - 1].endOffset = newStartOffset;
        }
        setVideo({
            ...video,
            clips
        });
    }

    const handleClipOffsetSecondsChange = (clipIndex, seconds) => {
        seconds = seconds ? parseInt(seconds) : 0;
        const clips = video.clips;
        const prevStartOffset = clips[clipIndex].startOffset;
        const prevStartOffsetSeconds = getSecondsFromClipOffsetValue(prevStartOffset);
        const newStartOffset = prevStartOffset - prevStartOffsetSeconds + (seconds);
        clips[clipIndex].startOffset = newStartOffset;
        if (clipIndex > 0) {
            clips[clipIndex - 1].endOffset = newStartOffset;
        }
        setVideo({
            ...video,
            clips
        });
    }

    const handleAddVideoClip = () => {
        if (!video.clips || !Array.isArray(video.clips)) {
            video.clips = [];
        }
        video.clips.push({
            name: {
                no: '',
                en: ''
            },
            startOffset: video.clips.length > 0 ? video.clips[video.clips.length - 1].startOffset : 0,
            endOffset: getOffsetValueFromDuration(video.duration),
        })
        handleClipsChange(video.clips);
    }

    const updateVideosInStore = () => {
        let newVideos = videos;
        newVideos[index] = video;
        dispatch(updateVideos(newVideos));
    }

    const renderVideoClipsList = () => {
        const videoClipsElements = video.clips?.length
            ? video.clips.map((clip, clipIndex) => {
                return (
                    <div key={clipIndex} className={commonStyle.formElement}>
                        <label htmlFor={`clips-name-no-${index}-${clipIndex}`}>
                            Norwegian name
                            <input type="text" id={`clips-name-no-${index}-${clipIndex}`} value={clip.name.no} onChange={event => handleClipNameChange(clipIndex, event.target.value, 'no')} onBlur={updateVideosInStore} />
                        </label>
                        <label htmlFor={`clips-name-en-${index}-${clipIndex}`}>
                            English name
                            <input type="text" id={`clips-name-en-${index}-${clipIndex}`} value={clip.name.en} onChange={event => handleClipNameChange(clipIndex, event.target.value, 'en')} onBlur={updateVideosInStore} />
                        </label>
                        <label htmlFor={`clips-startOffset-hours-${index}-${clipIndex}`} style={{ maxWidth: '70px' }}>
                            Hours
                            <input type="number" min="0" id={`clips-startOffset-hours-${index}-${clipIndex}`} value={getHoursFromClipOffsetValue(clip.startOffset)} onChange={event => handleClipOffsetHoursChange(clipIndex, event.target.value)} onBlur={updateVideosInStore} />
                        </label>
                        <label htmlFor={`clips-startOffset-minutes-${index}-${clipIndex}`} style={{ maxWidth: '70px' }}>
                            Minutes
                            <input type="number" min="0" max="60" id={`clips-startOffset-minutes-${index}-${clipIndex}`} value={getMinutesFromClipOffsetValue(clip.startOffset)} onChange={event => handleClipOffsetMinutesChange(clipIndex, event.target.value)} onBlur={updateVideosInStore} />
                        </label>
                        <label htmlFor={`clips-startOffset-seconds-${index}-${clipIndex}`} style={{ maxWidth: '70px' }}>
                            Seconds
                            <input type="number" min="0" max="60" id={`clips-startOffset-seconds-${index}-${clipIndex}`} value={getSecondsFromClipOffsetValue(clip.startOffset)} onChange={event => handleClipOffsetSecondsChange(clipIndex, event.target.value)} onBlur={updateVideosInStore} />
                        </label>
                        <label htmlFor={`duration-${clipIndex}`} style={{ maxWidth: '100px' }}>
                            Period
                            <span id={`duration-${clipIndex}`}>
                                {clip.startOffset} - {clip.endOffset}
                            </span>
                        </label>
                    </div>
                )
            })
            : '';
        return (
            <details>
                <summary>Clips {video.clips?.length || ''}</summary>
                {videoClipsElements}
                <button onClick={handleAddVideoClip} className={commonStyle.fullWidthButton}>
                    <FontAwesomeIcon icon={['fas', 'plus']} /> Add clip
                </button>
            </details>
        )
    }

    return video && Object.keys(video).length
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
                            selected={video.timestamp}
                            className={commonStyle.input} />
                    </label>
                    <label htmlFor={`orderNumber-${index}`}>
                        Order no.
                        <input type="number" id={`orderNumber-${index}`} min="0" value={video.orderNumber ? video.orderNumber : 0} onChange={event => handleOrderNumberChange(event.target.value)} />
                    </label>
                    <label htmlFor={`id-${index}`}>
                        ID
                        <span id={`id-${index}`}>
                            {video.id}
                        </span>
                    </label>
                    <label htmlFor={`thumbnailFilename-${index}`}>
                        Image filename
                        <span id={`thumbnailFilename-${index}`}>
                            {video.thumbnailFilename}_[filesize].[filetype]
                        </span>
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>Title</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`title-no-${index}`}>
                        Norwegian
                        <input type="text" id={`title-no-${index}`} value={video.title.no} onChange={event => handleTitleChange(event.target.value, 'no')} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`title-en-${index}`}>
                        English
                        <input type="text" id={`title-en-${index}`} value={video.title.en} onChange={event => handleTitleChange(event.target.value, 'en')} onBlur={updateVideosInStore} />
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>Content</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`content-no-${index}`}>
                        Norwegian
                        <textarea id={`content-no-${index}`} value={video.content.no} onChange={event => handleContentChange(event.target.value, 'no')} onBlur={updateVideosInStore}></textarea>
                    </label>
                    <label htmlFor={`content-en-${index}`}>
                        English
                        <textarea id={`content-en-${index}`} value={video.content.en} onChange={event => handleContentChange(event.target.value, 'en')} onBlur={updateVideosInStore}></textarea>
                    </label>
                </div>


                <span className={commonStyle.formElementGroupTitle}>Image</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`thumbnailDescription-${index}`}>
                        Image description
                        <input type="text" id={`thumbnailDescription-${index}`} value={video.thumbnailDescription} onChange={event => handleThumbnailDescriptionChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`thumbnailDescription-${index}`}>
                        Image copyright
                        <input type="checkbox" id={`copyright-${index}`} checked={video.copyright ? true : false} onChange={event => handleCopyrightChange(event.target.checked)} onBlur={updateVideosInStore} />
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>YouTube</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`youTubeChannelId-${index}`}>
                        Channel ID
                        <input type="text" id={`youTubeChannelId-${index}`} value={video.youTubeChannelId} onChange={event => handleYouTubeChannelIdChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`youTubeUser-${index}`}>
                        User ID
                        <input type="text" id={`youTubeUser-${index}`} value={video.youTubeUser} onChange={event => handleYouTubeUserChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`youTubeId-${index}`}>
                        Video ID
                        <input type="text" id={`youTubeId-${index}`} value={video.youTubeId} onChange={event => handleYouTubeIdChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                </div>

                <span className={commonStyle.formElementGroupTitle}>Duration</span>
                <div className={commonStyle.formElement}>
                    <label htmlFor={`duration-hours${index}`}>
                        Hours
                        <input type="number" min="0" id={`duration-hours-${index}`} value={getHoursFromDuration(video.duration)} onChange={event => handleDurationHoursChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`duration-minutes${index}`}>
                        Minutes
                        <input type="number" min="0" max="60" id={`duration-minutes-${index}`} value={getMinutesFromDuration(video.duration)} onChange={event => handleDurationMinutesChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`duration-seconds${index}`}>
                        Seconds
                        <input type="number" min="0" max="60" id={`duration-seconds-${index}`} value={getSecondsFromDuration(video.duration)} onChange={event => handleDurationSecondsChange(event.target.value)} onBlur={updateVideosInStore} />
                    </label>
                    <label htmlFor={`duration-${index}`}>
                        YouTube duration
                        <span id={`duration-${index}`}>
                            {video.duration}
                        </span>
                    </label>
                </div>

                {renderVideoClipsList()}

            </div>

        ) : ''
}

export default Video;
