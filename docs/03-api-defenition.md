## Create beautiful REST API docs authored in Markdown

------------------------------------------------------------------------------------------

#### Creating a new pet

<details>
 <summary> ▶️ <code>POST</code> <code><b>/pets</b></code> <code>(Creates a new pet in the clinic)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | name            |  required | string        | the name of the pet                                                   |
> | age             | required  | string        | the age of the pet                                                    |
> | favorite_treats | optional  | string[]      | a list of treats the pet loves to eat                                 |

##### Sample request body format:
```json
{
    "name": "Grumpy",
    "age": "5",
    "favorite_treats": [
        "biscuits",
        "apples",
        "chips"
    ]
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `text/plain;charset=UTF-8`        | `Configuration created successfully`                                |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                            |
> | `405`         | `text/html;charset=utf-8`         | None                                                                |

</details>

------------------------------------------------------------------------------------------

#### Listing pets in the clinic

<details>
 <summary> ▶️ <code>GET</code> <code><b>/</b></code> <code>(gets all pets in the clinic)</code></summary>

##### Parameters

> None

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `text/plain;charset=UTF-8`        | `{"code":"200","pets": [{"name":"Grumpy", "age":5 }]  `             |

</details>

------------------------------------------------------------------------------------------