## Runs wdip-be-{stage}-adminStartImport for a given date range
## and sub-interval length.
## Args (in order):
##     startDate (YYYY-MM-DD)
##     endDate (YYYY-MM-DD)
##     dateInterval (int)
##     documentType (mot|prop)
##     [opt] stage (test|prod)
## Output:
##     List of successful import invocations   (stderr)
##     List of unsuccessful import invocations (stdout)

from boto3 import Session as boto_session
from datetime import date, timedelta
import json
import sys

session = boto_session(profile_name='wdip-test')
client = session.client('lambda')

def parse_date_str(date_str):
    [start_year, start_month, start_day] = date_str.split('-')
    return date(int(start_year), int(start_month), int(start_day))

def get_date_range(start_datetime, end_datetime, interval_days):
    assert(start_datetime < end_datetime)
    assert(type(interval_days) == int)
    assert(interval_days > 0)

    ret = [start_datetime]
    last_datetime = start_datetime
    delta = timedelta(days=interval_days)
    while True:
        new_datetime = last_datetime + delta
        if new_datetime >= end_datetime:
            ret.append(end_datetime)
            break
        else:
            ret.append(new_datetime)
            last_datetime = new_datetime
    return ret

def invoke_import(start_datetime, end_datetime, doc_type, stage):
    payload = {
        'fromDate':     start_datetime.strftime('%Y-%m-%d'),
        'toDate':       end_datetime.strftime('%Y-%m-%d'),
        'documentType': doc_type
    }

    return client.invoke(
        FunctionName='wdip-be-%s-adminStartImport' % stage,
        Payload=json.dumps(payload)
    )

def parse_args():
    ret = {}
    assert(len(sys.argv) == 5 or len(sys.argv) == 6)
    
    ret['start_date']    = parse_date_str(sys.argv[1])
    ret['end_date']      = parse_date_str(sys.argv[2])
    ret['interval_days'] = int(sys.argv[3])
    ret['doc_type']      = sys.argv[4]
    ret['stage']         = sys.argv[5] if len(sys.argv) == 6 else 'test'
    return ret

args = parse_args()
date_range = get_date_range(args['start_date'], args['end_date'], args['interval_days'])

successfuls = []
unsuccessfuls = []
for i in range(0, len(date_range) - 1):
    range_start = date_range[i]
    range_end   = date_range[i+1]
    try:
        response = invoke_import(range_start, range_end, args['doc_type'], args['stage'])
        if response['StatusCode'] in {200,204}:
            print('Successful fetch from', range_start, 'to', range_end)
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

with open('out.json', 'w') as f:
    f.write(json.dumps({
        'successfuls': successfuls,
        'unsuccessfuls': unsuccessfuls
    }))
