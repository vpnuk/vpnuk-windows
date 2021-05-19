import React from 'react';
import { Layout } from 'antd';
import WorldImage from '@assets/world.png';
import '@components/index.css';

const Starting = () => {
    return (
        <div className="App">
            <Layout style={{ height: "100%" }}>
                <div className="wrapper-content">
                    <div className="column"></div>
                    <div className="column">
                        <div className="column-block column-image_world">
                            <img alt="world-img" src={`${WorldImage}`} />
                        </div>
                        <div className="column-block column-content_block">
                            <div className="column-content_block-title">Starting...</div>
                        </div>
                    </div>
                    <div className="column"></div>
                </div>
            </Layout>
        </div>
    );
}

export default Starting;