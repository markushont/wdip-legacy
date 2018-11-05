import * as React from 'react';
import { default as D3WordCloud } from 'react-d3-cloud';
import { Normalizer } from 'src/service/Normalizer';

class WordCloud extends React.Component<any, any> {

    private normalizer: Normalizer;
    private fontSizeMapper: any;

    /**
     * Returns a random roation; 0, 90 or 270 degrees.
     */
    private rotationMapper() {
        switch (Math.round(Math.random() * 3)) {
            case 1: return 0;
            case 2: return 90;
            case 3: return 270;
        }
        return 0;
    };

    public render() {
        if (this.props && this.props.data && Array.isArray(this.props.data) && this.props.data[0]) {
            // Create a new normalizer with the min and max values from the data set.
            const startValue = this.props.data[0].value;
            const min = this.props.data.reduce((minSoFar: number, curVal: any) => Math.min(minSoFar, curVal.value), startValue);
            const max = this.props.data.reduce((minSoFar: number, curVal: any) => Math.max(minSoFar, curVal.value), startValue);
            this.normalizer = new Normalizer(min, max);

            // Update the font size mapper to use the new normalizer.
            this.fontSizeMapper = (word: any) => this.normalizer.normalize(word.value);
        }
        return (
            <D3WordCloud
                data={this.props.data}
                fontSizeMapper={this.fontSizeMapper}
                rotate={this.rotationMapper}
            />);
    }
}

export default WordCloud;
