export default class MockLambdaPromise extends Promise<any> {
    public promise(): Promise<any> {
        return this as Promise<any>;
    }
}
