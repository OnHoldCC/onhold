local key, generation = KEYS[1], ARGV[1]
local initial, calendar, events = cjson.decode(ARGV[2]), cjson.decode(ARGV[3]), cjson.decode(ARGV[4])
if redis.call('HGET', key, 'generation') ~= generation then
    redis.call('DEL', key)
    redis.call('HSET', key, 'generation', generation, 'data', ARGV[2])
end
local data = cjson.decode(redis.call('HGET', key, 'data'))
local old_days = {}
for _, day in ipairs(data.stats.daily_clicks) do old_days[day.date] = day.clicks end
data.stats.daily_clicks = calendar
local days = {}
for _, day in ipairs(calendar) do
    day.clicks = old_days[day.date] or 0
    days[day.date] = day
end
local function unique(field)
    return redis.call('HSETNX', key, field, '1') == 1
end
for _, event in ipairs(events) do
    if unique('event:' .. event.id) then
        local stats, visitor = data.stats, event.visitor
        local has_visitor = visitor ~= cjson.null
        if event.kind == 'page_view' then
            stats.page_views = stats.page_views + 1
            if has_visitor and unique('uv:page:' .. visitor) then stats.page_uv = stats.page_uv + 1 end
        elseif event.kind == 'wallet_connect' then
            stats.wallet_connections = stats.wallet_connections + 1
        elseif event.kind == 'ad_click' then
            stats.ad_clicks = stats.ad_clicks + 1
            if days[event.day] then days[event.day].clicks = days[event.day].clicks + 1 end
            if event.site ~= cjson.null and event.site >= 0 and event.site < 6 then
                local site = event.site + 1
                stats.clicks_by_site[site] = stats.clicks_by_site[site] + 1
                if has_visitor and unique('uv:site:' .. event.site .. ':' .. visitor) then
                    stats.uv_by_site[site] = stats.uv_by_site[site] + 1
                end
                if event.campaign ~= cjson.null then
                    local count = data.campaigns[event.campaign] or {clicks = 0, uv = 0}
                    count.clicks = count.clicks + 1
                    if has_visitor and unique('uv:campaign:' .. event.campaign .. ':' .. visitor) then count.uv = count.uv + 1 end
                    data.campaigns[event.campaign] = count
                end
            end
        end
    end
end
data.stats.updated_at = tonumber(ARGV[5])
data.ready = data.ready or ARGV[6] == '1'
redis.call('HSET', key, 'data', cjson.encode(data))
return data.ready and 1 or 0
