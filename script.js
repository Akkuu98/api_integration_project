<!-- Add this in the head section of all three HTML files -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Add this script at the end of the customer_detail.html -->
<script>
    let customerData = null;
    const apiUrl = "https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp";
    const authTokenKey = "authToken";

    function getAuthToken() {
        return localStorage.getItem(authTokenKey);
    }

    function setAuthToken(token) {
        localStorage.setItem(authTokenKey, token);
    }

    function clearAuthToken() {
        localStorage.removeItem(authTokenKey);
    }

    function redirectToLogin() {
        window.location.href = "index.html";
    }

    function showError(message) {
        alert("Error: " + message);
    }

    function loadCustomerData() {
        const authToken = getAuthToken();
        if (!authToken) {
            redirectToLogin();
            return;
        }

        $.ajax({
            url: `${apiUrl}?cmd=get_customer_list`,
            type: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            success: function (data) {
                customerData = data;
                displayCustomers();
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    clearAuthToken();
                    redirectToLogin();
                } else {
                    showError("Failed to fetch customer list.");
                }
            },
        });
    }

    function displayCustomers() {
        const table = $("table");
        table.find("tbody").remove();
        const tbody = $("<tbody></tbody>");
        table.append(tbody);

        customerData.forEach((customer) => {
            const row = `<tr>
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td><button onclick="editCustomer('${customer.uuid}')">Edit</button></td>
            </tr>`;
            tbody.append(row);
        });
    }

    function editCustomer(uuid) {
        const customer = customerData.find((c) => c.uuid === uuid);
        if (!customer) {
            showError("Customer not found.");
            return;
        }

        $("#first_name").val(customer.first_name);
        $("#last_name").val(customer.last_name);
        $("#street").val(customer.street);
        $("#address").val(customer.address);
        $("#city").val(customer.city);
        $("#state").val(customer.state);
        $("#email").val(customer.email);
        $("#phone").val(customer.phone);

        $("#saveButton").text("Update");
        $("#deleteButton").show();
        $("#deleteButton").on("click", function () {
            deleteCustomer(uuid);
        });
    }

    function clearCustomerForm() {
        $("#customerForm")[0].reset();
        $("#saveButton").text("Save");
        $("#deleteButton").hide();
        $("#deleteButton").off("click");
    }

    function saveCustomer() {
        const authToken = getAuthToken();
        if (!authToken) {
            redirectToLogin();
            return;
        }

        const customer = {
            first_name: $("#first_name").val(),
            last_name: $("#last_name").val(),
            street: $("#street").val(),
            address: $("#address").val(),
            city: $("#city").val(),
            state: $("#state").val(),
            email: $("#email").val(),
            phone: $("#phone").val(),
        };

        let apiPath = apiUrl;
        let method = "POST";
        let cmd = "create";

        if ($("#saveButton").text() === "Update") {
            apiPath = `${apiUrl}?uuid=${customer.uuid}`;
            method = "POST";
            cmd = "update";
        }

        $.ajax({
            url: apiPath,
            type: method,
            data: {
                cmd: cmd,
                ...customer,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
           
