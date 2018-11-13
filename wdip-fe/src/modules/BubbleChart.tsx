import * as React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Normalizer } from 'src/service/Normalizer';


const GALTAN = { s: { x: 4, y: 4 },  m: { x: 9, y: 5 },
 l: {x: 6, y: 7 },  kd: {x: 7, y: 6 },
 v: {x: 0, y: 5 }, sd: {x: 5, y: 4 }, c: {x: 6, y: 8 }, mp: {x: 3, y: 9 }};

// const data01 = [{ parti: "mp", x: -20.3, y: 200, z: 200 }, {parti: "sd", x: 120, y: 100, z: 260 },
// { parti: "c", x: 170, y: 300, z: 400 }, { parti: "s", x: 140, y: 250, z: 280 },
// { parti: "v", x: 150, y: 400, z: 500 }, { parti: "m", x: 110, y: 280, z: 200 }];

class BubbleChart extends React.Component<any, any> {
    private normalizer: Normalizer;

    constructor(props: any) {
        super(props);
    }


    public render() {
        let bubbles;
        if (this.props.results) {

            const minSubmitted = this.props.results.reduce(function (prev: any, current: any) {
                return (prev.submitted < current.submitted) ? prev : current
             }).submitted;

            const maxSubmitted = this.props.results.reduce(function (prev: any, current: any) {
                return (prev.submitted > current.submitted) ? prev : current
             }).submitted;

            this.normalizer = new Normalizer(minSubmitted, maxSubmitted);

            bubbles = this.props.results.map((result: any) => ({
                parti: result.party,
                normaliseradSumma: this.normalizer.normalize(result.submitted),
                summa: result.submitted, 
                bifall: result.approved,
                avslag: result.declined,
            }));

            for(let bubble of bubbles){
                bubble.position = GALTAN[bubble.parti];
            }

            console.log(bubbles);
        }

        return (
            <div className="chart">
                <ScatterChart width={500} height={500} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey={'position.x'} name='stature' unit='cm' />
                    <YAxis type="number" dataKey={'position.y'} name='weight' unit='kg' />
                    <ZAxis dataKey={'normaliseradSumma'} range={[0, 10000]} name='score' unit='km' />
                    <CartesianGrid />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name='Parti' data={bubbles} fill='#8884d8' shape="circle" />
                </ScatterChart>
            </div>
        );
    }
}

export default BubbleChart;
