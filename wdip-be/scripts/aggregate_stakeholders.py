## Runs wdip-be-{stage}-aggregateStakeholders for a given date range
## and sub-interval length.
## Args (in order):
##     startDate (YYYY-MM-DD)
##     endDate (YYYY-MM-DD)
##     dateInterval (int)
##     [opt] stage (test|prod)
## Output:
##     aggregate_stakeholders_[epoch_time].json

from boto3 import Session as boto_session
from date_util import get_date_range, parse_date_str
import json
import sys
from time import time

LAMBDA_NAME = 'wdip-be-%s-aggregateStakeholders'

session = boto_session(profile_name='wdip-test')
client = session.client('lambda')

def parse_payload(invocation_response):
    return json.loads(invocation_response['Payload'].read().decode('utf-8'))

def parse_args():
    ret = {}
    assert(len(sys.argv) == 4 or len(sys.argv) == 5)
    
    ret['start_date']    = parse_date_str(sys.argv[1])
    ret['end_date']      = parse_date_str(sys.argv[2])
    ret['interval_days'] = int(sys.argv[3])
    ret['stage']         = sys.argv[4] if len(sys.argv) == 5 else 'test'
    return ret

def invoke_entry(start_datetime, end_datetime):
    payload = {
        'fromDate':     start_datetime.strftime('%Y-%m-%d'),
        'toDate':       end_datetime.strftime('%Y-%m-%d')
    }

    return client.invoke(
        FunctionName=LAMBDA_NAME,
        Payload=json.dumps(payload)
    )

def invoke_scroll(scroll_id):
    payload = { 'scrollId': scroll_id }
    return client.invoke(
        FunctionName=LAMBDA_NAME,
        Payload=json.dumps(payload)
    )

def scroll(scroll_id):
    response = invoke_scroll(scroll_id)
    if response['StatusCode'] in {200, 204}:
        print('Successful scroll with id', scroll_id)
        payload = parse_payload(response)
        if payload['body'] and payload['body']['scrollId']:
            return scroll(payload['body']['scrollId'])
    elif response['StatusCode'] == 500:
        raise Exception('Failed scroll with id %s' % scroll_id)

args = parse_args()
LAMBDA_NAME = LAMBDA_NAME % args['stage']
date_range = get_date_range(args['start_date'], args['end_date'], args['interval_days'])

successfuls = []
unsuccessfuls = []
for i in range(0, len(date_range) - 1):
    range_start = date_range[i]
    range_end = date_range[i+1]
    try:
        response = invoke_entry(range_start, range_end)
        if response['StatusCode'] in {200, 204}:
            payload = parse_payload(response)
            if payload['body'] and payload['body']['scrollId']:
                print('Scrolling date range', range_start, ',', range_end)
                scroll(payload['body']['scrollId'])
            print('Successful fetch from ', range_start, 'to', range_end)
            successfuls.append({
                'range_start': range_start.strftime('%Y-%m-%d'),
                'range_end': range_end.strftime('%Y-%m-%d')
            })
        elif response['FunctionError']:
            print('Unsuccessful fetch from', range_start, 'to', range_end)
            unsuccessfuls.append({
                'range_start': range_start.strftime('%Y-%m-%d'),
                'range_end': range_end.strftime('%Y-%m-%d'),
                'FunctionError': response['FunctionError']
            })
    except:
        unsuccessfuls.append({
            'range_start': range_start.strftime('%Y-%m-%d'),
            'range_end': range_end.strftime('%Y-%m-%d'),
            'error': 'Caught an Exception, something went wrong'
        })

epoch = int(time())
with open('aggregate_stakeholders_%d.json' % epoch, 'w') as f:
    f.write(json.dumps({
        'successfuls': successfuls,
        'unsuccessfuls': unsuccessfuls
    }))
