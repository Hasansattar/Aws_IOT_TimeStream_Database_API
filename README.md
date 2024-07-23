# AWS Timestream Data API Documentation

# 1) Data Query API 


**API Name:** AWS Timestream Data Query API  
**Description:** This API allows users to query IoT data from AWS Timestream based on different intervals (day, week, month, year) and specified ports.

## Authentication

To access the API, you need to authenticate using an API key. Include your API key in the `Authorization` header of each request:

### Authorization: Bearer YOUR_API_KEY


## Query: `getIotData`

**Description:** Retrieves IoT data from AWS Timestream based on the specified interval and port.

**Parameters:**
- `interval` (required, string): The time interval for querying data. Accepted values are `day`, `week`, `month`, and `year`.
- `port` (required, string): The port for which to retrieve data.

**Example Request:**
```graphql
query MyQuery {
  getIotData(interval: "month", port: "x04") {
    port
    zone
    plant
    sensor_type
    sensor_name
    measure_name
    time
    Totaliser1_L
    Flow_Lpmin
    Temperature_C
    DeviceStatus
    Flow_Lph
    Totaliser1_m3
    Flow_m3ph
    Flow_mps
    Pressure_MPa
    Pressure_bar
    Conductivity_mcSpcm
    Temperature_F
    currentTankLevel
    filter1Result
    filter2Result
  }
}

```


##  Example Response:

```json

{
  "data": {
    "getIotData": [
      {
        "port": "x04",
        "zone": "Zone1",
        "plant": "PlantA",
        "sensor_type": "Temperature",
        "sensor_name": "TempSensor1",
        "measure_name": "Temperature_C",
        "time": "2024-06-01T00:00:00Z",
        "Totaliser1_L": 123.45,
        "Flow_Lpmin": 67.89,
        "Temperature_C": 25.5,
        "DeviceStatus": "OK",
        "Flow_Lph": 4000,
        "Totaliser1_m3": 0.123,
        "Flow_m3ph": 4.0,
        "Flow_mps": 0.1,
        "Pressure_MPa": 0.2,
        "Pressure_bar": 2.0,
        "Conductivity_mcSpcm": 1500,
        "Temperature_F": 77.9,
        "currentTankLevel": "",
        "filter1Result": "",
        "filter2Result": ""
      }
      // More data points...
    ]
  }
}
```

### Error Handling

* 400: Bad Request - Invalid input parameters.
* 401: Unauthorized - Invalid API key.
* 404: Not Found - Resource not found.
* 500: Internal Server Error - An unexpected error occurred.


# 2) Subscriptions for tank level and pressure filters

**API Name:** Real-Time Data Subscription API  
**Description:** This API provides real-time data subscriptions for various intervals (day, minute, month, week) related to tank and pressure data.

## Authentication

To access the subscription API, you need to authenticate using an API key. Include your API key in the `Authorization` header of the WebSocket connection.

## Subscriptions

### Subscription: `onTankAndPressureDataForDay`

**Description:** Subscribes to real-time updates for tank and pressure data with a daily interval.

**Fields:**
- `currentTankLevel` (float): Current tank level.
- `filter1Result` (float): Result from filter 1.
- `filter2Result` (float): Result from filter 2.
- `interval` (string): Interval for the data updates (e.g., "day").

**Example Subscription:**
```graphql
subscription MySubscription {
  onTankAndPressureDataForDay {
    currentTankLevel
    filter1Result
    filter2Result
    interval
  }
}
```


**Example Response:**

```json
{
  "data": {
    "onTankAndPressureDataForDay": {
      "currentTankLevel": "9008.320852181536",
      "filter1Result": "5.224096527777823",
      "filter2Result": "5.207651388888919",
      "interval": "day"
    }
  }
}


```


#### Subscription: 'onTankAndPressureDataForMinute' 


**Description:**  Subscribes to real-time updates for tank and pressure data with a minute interval.

**Fields:**

- currentTankLevel (float): Current tank level.
- filter1Result (float): Result from filter 1.
- filter2Result (float): Result from filter 2.
- interval (string): Interval for the data updates (e.g., "minute").



#### Subscription: 'onTankAndPressureDataForMonth'
**Description:** Subscribes to real-time updates for tank and pressure data with a monthly interval.

**Fields:**

- currentTankLevel (float): Current tank level.
- filter1Result (float): Result from filter 1.
- filter2Result (float): Result from filter 2.
- interval (string): Interval for the data updates (e.g., "month").

#### Subscription: 'onTankAndPressureDataForWeek'
**Description:** Subscribes to real-time updates for tank and pressure data with a weekly interval.

**Fields:**

- currentTankLevel (float): Current tank level.
- filter1Result (float): Result from filter 1.
- filter2Result (float): Result from filter 2.
- interval (string): Interval for the data updates (e.g., "week").


# 3) Subscription for ports


**API Name:** Real-Time Data Subscription API  
**Description:** This API provides real-time data subscriptions for different ports, delivering updates based on minute intervals.

## Authentication

To access the subscription API, you need to authenticate using an API key. Include your API key in the `Authorization` header of the WebSocket connection.

## Port Subscriptions

### Subscription: `onPublishNewDataForPortX01ForMinute`

**Description:** Subscribes to real-time updates for port X01 with minute-level granularity.

**Fields:**
- `zone` (string): Zone information.
- `time` (string): Timestamp of the data.
- `port` (string): Port identifier (e.g., X01).
- `plant` (string): Plant name.
- `measure_name` (string): Name of the measurement.
- `sensor_type` (string): Type of sensor.
- `sensor_name` (string): Name of the sensor.
- `Pressure_bar` (float): Pressure value in bars.
- `Temperature_C` (float): Temperature value in Celsius.
- `DeviceStatus` (string): Status of the device.

**Example Subscription:**
```graphql
subscription MySubscription {
  onPublishNewDataForPortX01ForMinute {
    zone
    time
    port
    plant
    measure_name
    sensor_type
    sensor_name
    Pressure_bar
    Temperature_C
    DeviceStatus
  }
}

```



**Example Response:**

```json
{
  "data": {
    "onPublishNewDataForPortX01ForMinute": {
      "zone": "sea_intake",
      "time": "2024-06-18 22:52:35.000000000",
      "port": "x01",
      "plant": "alon",
      "measure_name": "data",
      "sensor_type": "pressure",
      "sensor_name": "PM1504",
      "Pressure_bar": 6.136,
      "Temperature_C": 20.18,
      "DeviceStatus": "DeviceIsOK"
    }
  }
}
```

**Subscription: onPublishNewDataForPortX04ForMinute**
**Description:** Subscribes to real-time updates for port X04 with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForPortX01ForMinute)

**Subscription: onPublishNewDataForPortX05ForMinute**
**Description:** Subscribes to real-time updates for port X05 with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForPortX01ForMinute)

**Subscription: onPublishNewDataForPortX07ForMinute**
**Description:** Subscribes to real-time updates for port X07 with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForPortX01ForMinute)

**Subscription: onPublishNewDataForPortX08ForMinute**
**Description:** Subscribes to real-time updates for port X08 with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForPortX01ForMinute)


# 4) Subscription for  Zones

**API Name:** Real-Time Data Subscription API  
**Description:** This API provides real-time data subscriptions for different zones, delivering updates based on minute intervals.

## Authentication

To access the subscription API, you need to authenticate using an API key. Include your API key in the `Authorization` header of the WebSocket connection.

## Zone Subscriptions

### Subscription: `onPublishNewDataForZoneDistributionForMinute`

**Description:** Subscribes to real-time updates for the distribution zone with minute-level granularity.

**Fields:**
- `DeviceStatus` (string): Status of the device.
- `Flow_Lpmin` (float): Flow rate in liters per minute.
- `Temperature_C` (float): Temperature in Celsius.
- `Totaliser1_L` (float): Totalizer 1 value.
- `measure_name` (string): Name of the measurement.
- `plant` (string): Plant name.
- `port` (string): Port identifier.
- `sensor_name` (string): Name of the sensor.
- `sensor_type` (string): Type of sensor.
- `time` (string): Timestamp of the data.
- `zone` (string): Zone identifier.

**Example Subscription:**
```graphql
subscription MySubscription {
  onPublishNewDataForZoneDistributionForMinute {
    DeviceStatus
    Flow_Lpmin
    Temperature_C
    Totaliser1_L
    measure_name
    plant
    port
    sensor_name
    sensor_type
    time
    zone
  }
}


```



**Example Response:**

```json

{
  "data": {
    "onPublishNewDataForZoneDistributionForMinute": {
      "DeviceStatus": "DeviceIsOK",
      "Flow_Lpmin": 0.0,
      "Temperature_C": 20.150000000000002,
      "Totaliser1_L": 1136077568000.0,
      "measure_name": "data",
      "plant": "alon",
      "port": "x04",
      "sensor_name": "SU8020",
      "sensor_type": "flow",
      "time": "2024-06-18 23:08:36.000000000",
      "zone": "distribution"
    }
  }
}


```


**Subscription: onPublishNewDataForZoneFilter1ForMinute**
**Description:** Subscribes to real-time updates for the filter1 zone with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForZoneDistributionForMinute)

**Subscription: onPublishNewDataForZoneFilter2ForMinute**
**Description:*** Subscribes to real-time updates for the filter2 zone with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForZoneDistributionForMinute)

**Subscription: onPublishNewDataForZoneProductionForMinute**
**Description:** Subscribes to real-time updates for the production zone with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForZoneDistributionForMinute)

**Subscription: onPublishNewDataForZoneSeaIntakeForMinute**
**Description:** Subscribes to real-time updates for the sea intake zone with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForZoneDistributionForMinute)


# 5) Subscription for Sensor types

**API Name:** Real-Time Data Subscription API  
**Description:** This API provides real-time data subscriptions for different sensors, delivering updates based on minute intervals.

## Authentication

To access the subscription API, you need to authenticate using an API key. Include your API key in the `Authorization` header of the WebSocket connection.

## Sensor Subscriptions

### Subscription: `onPublishNewDataForSensorConductivityForMinute`

**Description:** Subscribes to real-time updates for conductivity sensor data with minute-level granularity.

**Fields:**
- `Conductivity_mcSpcm` (float): Conductivity value in microsiemens per centimeter.
- `DeviceStatus` (string): Status of the device.
- `Pressure_bar` (float): Pressure value in bars.
- `Temperature_C` (float): Temperature in Celsius.
- `measure_name` (string): Name of the measurement.
- `plant` (string): Plant name.
- `port` (string): Port identifier.
- `sensor_name` (string): Name of the sensor.
- `sensor_type` (string): Type of sensor.
- `time` (string): Timestamp of the data.
- `zone` (string): Zone identifier.

**Example Subscription:**
```graphql
subscription MySubscription {
  onPublishNewDataForSensorConductivityForMinute {
    Conductivity_mcSpcm
    DeviceStatus
    Pressure_bar
    Temperature_C
    measure_name
    plant
    port
    sensor_name
    sensor_type
    time
    zone
  }
}
```


**Example Response:**
```json
{
  "data": {
    "onPublishNewDataForSensorConductivityForMinute": {
      "Conductivity_mcSpcm": 7353.0,
      "DeviceStatus": "DeviceIsOK",
      "Pressure_bar": "$ctx.arguments.input.Pressure_bar",
      "Temperature_C": 20.400000000000002,
      "measure_name": "data",
      "plant": "alon",
      "port": "x03",
      "sensor_name": "LDL2xx-1",
      "sensor_type": "conductivity",
      "time": "2024-06-18 23:20:05.000000000",
      "zone": "sea_intake"
    }
  }
}
```


**Subscription: onPublishNewDataForSensorFlowForMinute**
**Description:** Subscribes to real-time updates for flow sensor data with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForSensorConductivityForMinute)

**Subscription: onPublishNewDataForSensorPressureForMinute**
**Description:** Subscribes to real-time updates for pressure sensor data with minute-level granularity.

**Fields:** (Similar to onPublishNewDataForSensorConductivityForMinute)



# 6) Subcription for Plant

**API Name:** Real-Time Data Subscription API  
**Description:** This API provides real-time data subscriptions for specific plants, delivering updates based on minute intervals.

## Authentication

To access the subscription API, you need to authenticate using an API key. Include your API key in the `Authorization` header of the WebSocket connection.

## Plant Subscriptions

### Subscription: `onPublishNewDataForPlantAlonForMinute`

**Description:** Subscribes to real-time updates for the Alon plant with minute-level granularity.

**Fields:**
- `DeviceStatus` (string): Status of the device.
- `Temperature_C` (float): Temperature in Celsius.
- `measure_name` (string): Name of the measurement.
- `plant` (string): Plant name.
- `port` (string): Port identifier.
- `sensor_name` (string): Name of the sensor.
- `sensor_type` (string): Type of sensor.
- `time` (string): Timestamp of the data.
- `zone` (string): Zone identifier.

**Example Subscription:**
```graphql
subscription MySubscription {
  onPublishNewDataForPlantAlonForMinute {
    DeviceStatus
    Temperature_C
    measure_name
    plant
    port
    sensor_name
    sensor_type
    time
    zone
  }
}
```

**Example Response:**


```json
{
  "data": {
    "onPublishNewDataForPlantAlonForMinute": {
      "DeviceStatus": "DeviceIsOK",
      "Temperature_C": 20.6,
      "measure_name": "data",
      "plant": "alon",
      "port": "x04",
      "sensor_name": "SU8020",
      "sensor_type": "flow",
      "time": "2024-06-18 23:28:38.000000000",
      "zone": "distribution"
    }
  }
}

```



## Error Handling
The subscription may encounter errors due to connectivity issues or other server-side problems. Implement error handling to manage these scenarios.



