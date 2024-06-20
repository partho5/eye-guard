import React, { useState } from 'react';
import './Options.css';
import defaultSettings from '../../Config/defaultSettings';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {

  const [autoHideNotificationTime, setAutoHideNotificationTime] = useState(defaultSettings.autoHideNotificationTime);


  const handleAutoHideNotificChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setAutoHideNotificationTime(newValue);
  }

  return (
    <div className="container">
      <div className="header">
        <h3 className="font-play-bold">Eye Guard</h3>
        <h1 className="font-play-bold">Customize to fit your needs</h1>
      </div>

      <div className="content">
        <div className="preferences">

          <div className="section section-blue">
            <div className="title">More Comfort</div>
            <div className="body">
              <div className="preference">
                <span>Auto hide notification after</span>
                <input
                className='input-field'
                  type="number"
                  id="auto-hide-notific-input"
                  value={autoHideNotificationTime}
                  min="10"
                  max="60"
                  step="10"
                  onChange={handleAutoHideNotificChange}
                />
                seconds
              </div>

              <div className="preference">
                <input type="checkbox" />
                <span>Play sound</span>
              </div>
            </div>
          </div>

          <div className="section section-green">
            <div className="title">Eliminate Side-effects</div>
            <div className="body">
              <div className="preference">
                <span>Disable for next</span>
                <input
                className='input-field'
                  type="number"
                  id="disable-time-input"
                  value="24"
                  min="1"
                  max="90"
                />
                <select className='input-field' id="disable-time-unit">
                  <option value="minute">minutes</option>
                  <option value="hour">hours</option>
                  <option value="day">days</option>
                </select>
              </div>

              <div className="preference">
                <span>Disable when I am visiting these websites</span>
                <br/>
                <textarea placeholder='https://www.example.com/' className='input-field' style={{width:"80%", height: "100px"}}></textarea>
              </div>

              <div className="preference">
                <span>Do not disturb between</span>
                <input className='input-field' style={{width:"10%"}} type="number" />
                and
                <input className='input-field' style={{width:"10%"}}   type="number" />
              </div>

            </div>
          </div>

          <div className="section section-orange">
            <div className="title">About</div>
            <div className="body">
              <div className="preference">
                <h6 className='secondary-title'>About this project</h6>
                <div>This CSS will apply the style to the second and third .preference elements, but not the first one.</div>
                <br/>
                <h6 className='secondary-title'>About developer</h6>
                <div>By ensuring that the input value is properly converted to a number, you maintain type safety and ensure that your state reflects the correct data type.</div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Options;
