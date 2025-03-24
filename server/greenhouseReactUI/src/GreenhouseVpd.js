import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';
import { PiPlus } from "react-icons/pi";
import { PiMinus } from "react-icons/pi";
/**
 * Set the greenhouse VPD
 * @returns {JSX.Element} The component.
 */
const GreenhouseVpd = ({ configData, configservice }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lightOn = configData.doc.lightOnOff[0];
  const lightOff = configData.doc.lightOnOff[1];
  const lowTemp = configData.doc.temperatureRange[0];
  const highTemp = configData.doc.temperatureRange[1];  
  const tapOnOne = configData.doc.wateringTimes[0].split(":")[0]
  const tapOnTwo = configData.doc.wateringTimes[1].split(":")[0]
  const tapOnThree = configData.doc.wateringTimes[2].split(":")[0]

  const [minVpd, setMinVpd] = useState("0.4") // configData.doc.VpdRange[0]);
  const [maxVpd, setMaxVpd] = useState("1.6") // configData.doc.VpdRange[1]);

  function decrementVpd(v) {
      let f = parseFloat(v)
      f = f - 0.1
      if (f < 0) f = 0
      return f.toFixed(1);
  }

  function incrementVpd(v) {
    let f = parseFloat(v)
    f = f + 0.1
    if (f > 2) f = 2
    return f.toFixed(1);

}

  const handleOnSubmit = (event, configData, configservice) => {

    event.preventDefault();

    console.log("On Submit: ")


    configData = JSON.stringify({
      "lightState": lightState,
      "lightOnOff": [
        lightOn,
        lightOff
      ],
      "pumpState": pumpState,
      "fanState": fanState,
      "heaterState": heaterState,
      "wateringTimes": [
        tapOnOne,
        tapOnTwo,
        tapOnThree
      ],
      "windowState": heaterState,
      "temperatureRange": [
        lowTemp,
        highTemp
      ],
      "VpdRange": [
        minVpd,
        maxVpd
      ]
    })


    console.log("POST: " + configservice)
    console.log("SEND: " + JSON.stringify(configData))

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Send data to the backend via POST
    fetch(configservice, {
      method: 'POST',
      mode: 'cors',
      headers: myHeaders,
      body: configData // body data type must match "Content-Type" header

    }).then(    
      setTimeout(() => {
      window.location.reload(true);
      }, 500))
    .catch(error => console.error(error));    


  };

  return (

    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Min:&nbsp;</h3>
        <Knob value={minVpd}  min={0} max={2} valueColor="blue" rangeColor="lightgray" />
        <Button icon={PiPlus} onClick={() => setMinVpd(incrementVpd(minVpd))} disabled={minVpd === 2} />
        <Button icon={PiMinus} onClick={() => setMinVpd(decrementVpd(minVpd))} disabled={minVpd === 0} />

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Max:&nbsp;</h3>
       
        <Knob value={maxVpd}  min={0} max={2} valueColor="red" rangeColor="lightgray" />
        <Button icon={PiPlus} onClick={() => setMaxVpd(incrementVpd(maxVpd))} disabled={maxVpd === 2} />
        <Button icon={PiMinus} onClick={() => setMaxVpd(decrementVpd(maxVpd))} disabled={maxVpd === 0} />

      </div>

      <div></div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button label=" Apply" inputid="applyVpd" name="applyVpd" value="Apply" onClick={(e) => handleOnSubmit(e, { configData}, configservice)} tooltip="Select min and max Vpd" />
      </div>

    </div>

  );

};

export default GreenhouseVpd;