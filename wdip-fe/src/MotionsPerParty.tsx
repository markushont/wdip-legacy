import * as React from 'react';

class MotionsByParty extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    public render() {
        let tableRows;
        if (this.props.results)
            tableRows = this.props.results.map((result: any) => <tr><td>{result.party}</td><td>{result.submitted}</td><td>{result.approved}</td><td>{result.declined}</td></tr>);

        return (
            <div>
                <p>{this.props.fromDate} - {this.props.toDate}</p>
                <table>
                    <thead>
                        <td>Parti</td><td>Totalt antal motioner</td><td>Godkända</td><td>Avslagna</td>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div >
        );
    }
}

export default MotionsByParty;
