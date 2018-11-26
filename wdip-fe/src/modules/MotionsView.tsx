import * as React from 'react';
import { Bubble } from 'react-chartjs-2';

const data = {
    datasets: [
        {
          label: "China",
          backgroundColor: "rgba(255,221,50,0.2)",
          borderColor: "rgba(255,221,50,1)",
          data: [{
            x: 3,
            y: 5.245,
            r: 15
          }]
        }, {
          label: "Denmark",
          backgroundColor: "rgba(60,186,159,0.2)",
          borderColor: "rgba(60,186,159,1)",
          data: [{
            x: 5,
            y: 7.526,
            r: 10
          }]
        }, {
          label: "Germany",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderColor: "#000",
          data: [{
            x: 7,
            y: 6.994,
            r: 15
          }]
        }, {
          label: "Japan",
          backgroundColor: "rgba(193,46,12,0.2)",
          borderColor: "rgba(193,46,12,1)",
          data: [{
            x: 5,
            y: 5.921,
            r: 15
          }]
        }
      ]
}

class MotionsView extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }



    public render() {

        return (
            <div>
                <Bubble
                    type='bubble'
                    data={data}
                    width={500}
                    height={500} />
            </div>
        );
    }
}

export default MotionsView;