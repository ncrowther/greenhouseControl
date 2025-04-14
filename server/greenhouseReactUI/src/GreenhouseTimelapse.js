import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
/**
 * Show greenhouse timelapse photos
 * @returns {JSX.Element} The component.
 */
const GreenhouseTimelapse = ({ photoData }) => {

    const [images, setImages] = useState(null);
    const responsiveOptions = [
        {
            breakpoint: '991px',
            numVisible: 12
        },
        {
            breakpoint: '767px',
            numVisible: 12
        },
        {
            breakpoint: '575px',
            numVisible: 12
        }
    ];

    useEffect(() => {
        setImages(photoData.Docs);
    }, [])

    const itemTemplate = (item) => {
        return <img src={'data:image/jpeg;base64,' + item.photo} alt={item.timestamp} style={{ width: '100%' }} />
    }

    const thumbnailTemplate = (item) => {
        return <img src={'data:image/jpeg;base64,' + item.photo} alt={item.timestamp} style={{ width: '100%', height: '100%'}} />
    }

    return (
        <div className="card">
            <Galleria value={images} responsiveOptions={responsiveOptions} numVisible={50} style={{ maxWidth: '480px' }} 
                item={itemTemplate} thumbnail={thumbnailTemplate} circular autoplay transitionInterval={1000}/>
                    
        </div>
    )
}

export default GreenhouseTimelapse;