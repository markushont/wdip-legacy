from datetime import date, timedelta

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