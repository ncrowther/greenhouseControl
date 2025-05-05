import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
/**
 * Show greenhouse timelapse photos
 * @returns {JSX.Element} The component.
 */
const GreenhouseTimelapse = ({ timelapseData }) => {

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
        setImages(timelapseData.Docs);
    }, [])

    const itemTemplate = (item) => {
        return <img src={'data:image/jpeg;base64,' + item.photo} alt={item.timestamp} style={{ width: '100%', display: 'block' }} />;
    }

    const thumbnailTemplate = (item) => {
        return <img src={'data:image/jpeg;base64,' + item.photo} alt={item.timestamp} style={{ width: '10%', height: '10%'}} />
    }

    return (
        <div className="card">
            <Galleria value={images} responsiveOptions={responsiveOptions} numVisible={5} style={{ maxWidth: '480px' }} 
                item={itemTemplate} thumbnail={thumbnailTemplate} circular autoPlay transitionInterval={600}/>
                    
        </div>
    )
}

export default GreenhouseTimelapse;