import * as React from 'react';
import { BarChart, Tooltip, Legend, Bar, CartesianGrid, YAxis, XAxis } from 'recharts';

class Chart extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    public render() {
        let tableRows;
        if (this.props.results) {
            tableRows = this.props.results.map((result: any) => ({
                parti: result.party,
                bifall: result.approved,
                avslag: result.declined
            }));
        }

        return (
            <div className="chart">
                <BarChart width={730} height={250} data={tableRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="parti" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bifall" stackId="a" fill="#8884d8" />
                    <Bar dataKey="avslag" stackId="a" fill="#82ca9d" />
                </BarChart>
            </div>
        );
    }
}

export default Chart;
