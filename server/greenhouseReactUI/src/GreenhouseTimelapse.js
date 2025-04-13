import React, { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
/**
 * Show greenhouse timelapse photos
 * @returns {JSX.Element} The component.
 */
const GreenhouseTimelapse = ({ photoData }) => {

    const [images, setImages] = useState(null);

    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    useEffect(() => {
        setImages(photoData.Docs);
    }, [])

    const itemTemplate = (item) => {
        return (
            <div>
                <div className="border-1 surface-border border-round m-2 text-center py-5 px-3">
                    <img src={'data:image/jpeg;base64,' + item.photo} alt={item.timestamp} className="w-6 shadow-2" />
                </div>
                <div>
                    <h4 className="mb-1">{item.timestamp}</h4>
                </div>
            </div >     
        )                 

    }

    return (
        <div className="card">
            <Carousel value={images} numVisible={3} numScroll={1} verticalViewPortHeight="480px" itemTemplate={itemTemplate} />
        </div>
    )
}

export default GreenhouseTimelapse;