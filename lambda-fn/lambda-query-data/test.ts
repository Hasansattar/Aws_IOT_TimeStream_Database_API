`WITH FlowX08 AS (
    SELECT 
        bin(time, 10m) AS time_interval,
        AVG(Flow_Lpmin) AS avgFlowLpminX08
    FROM "AquaControl"."plant_alon"
    WHERE time BETWEEN ago(1d + 10m) AND now()  -- Adjust time window as needed
      AND port = 'x08'
    GROUP BY bin(time, 10m)
),

FlowX04 AS (
    SELECT 
        bin(time, 10m) AS time_interval,
        AVG(Flow_Lpmin) AS avgFlowLpminX04
    FROM "AquaControl"."plant_alon"
    WHERE time BETWEEN ago(1d + 10m) AND now()  -- Adjust time window as needed
      AND port = 'x04'
    GROUP BY bin(time, 10m)
),

CurrentTankLevels AS (
    SELECT 
        f04.time_interval,
        CASE 
            WHEN COALESCE(f08.avgFlowLpminX08, 0) > 1 THEN 9000 - f04.avgFlowLpminX04 + COALESCE(f08.avgFlowLpminX08, 0)
            ELSE 9000 - f04.avgFlowLpminX04
        END AS currentTankLevel
    FROM 
        FlowX04 f04
    LEFT JOIN 
        FlowX08 f08
    ON 
        f04.time_interval = f08.time_interval
)

TenMinIntervals AS ( SELECT 
    time_interval,
    MAX(currentTankLevel) AS highest_currentTankLevel,
    MIN(currentTankLevel) AS lowest_currentTankLevel,
    AVG(currentTankLevel) AS average_currentTankLevel
FROM 
    CurrentTankLevels
GROUP BY 
    time_interval
),


SixHourIntervals AS (
  SELECT 
      bin(time_interval, 360m) AS time_interval_6h,
      MAX(highest_currentTankLevel) AS highest_currentTankLevel_6h,
      MIN(lowest_currentTankLevel) AS lowest_currentTankLevel_6h,
      AVG(average_currentTankLevel) AS average_currentTankLevel_6h
  FROM 
      10MinIntervals
  GROUP BY 
      bin(time_interval, 360m)
)


SELECT 
    time_interval_6h,
    highest_currentTankLevel_6h,
    lowest_currentTankLevel_6h,
    average_currentTankLevel_6h
FROM 
    SixHourIntervals
ORDER BY 
    time_interval_6h DESC

    `