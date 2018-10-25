import * as React from 'react';
import {Bar} from 'react-chartjs-2';

class Chart extends React.Component<any, any>{
    constructor(props: any){
        super(props);
        this.state = {
            chartData:{
                labels:['S','M','MP'],
                datasets:[{
                    label:'test1',
                    data:[
                        3,
                        4,
                        2
                    ],
                    backgroundColor:[
                        'rgba(244,99,142,0.6)',
                        'rgba(158,99,20,0.6)',
                        'rgba(244,19,142,0.6)'
                    ]
                }
                ]
            }
        }
    }
    render(){
        return (
            <div className="chart">
                <Bar 
                    data = {this.state.chartData}
                    options={{                    }}
            />
            </div>
        )
    }
}

export default Chart;