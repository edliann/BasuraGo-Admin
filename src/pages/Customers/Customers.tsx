import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getCustomers,
} from "../../services/firebase/customers/customers.services";

import type {
  Customer,
} from "../../services/firebase/customers/customers.types";

import "./Customers.css";

type StatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "suspended";

function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const customerList =
          await getCustomers();

        setCustomers(customerList);
      } catch (err) {
        console.error(
          "Failed to load customers:",
          err,
        );

        setError(
          "Failed to load customers. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.fullName
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.phoneNumber
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.id
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        customer.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    customers,
    search,
    statusFilter,
  ]);

  if (loading) {
    return (
      <section className="customers-page">
        <div className="customers-header">
          <div>
            <h1>Customers</h1>
            <p>
              Manage BasuraGo customers.
            </p>
          </div>
        </div>

        <div className="customers-state">
          Loading customers...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="customers-page">
        <div className="customers-header">
          <div>
            <h1>Customers</h1>
            <p>
              Manage BasuraGo customers.
            </p>
          </div>
        </div>

        <div className="customers-state customers-error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="customers-page">
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage BasuraGo customers.
          </p>
        </div>

        <span className="customers-count">
          {filteredCustomers.length} of{" "}
          {customers.length} customer
          {customers.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      <div className="customers-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search name, email, phone, or ID..."
          className="customers-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as StatusFilter,
            )
          }
          className="customers-status-filter"
        >
          <option value="all">
            All statuses
          </option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
          <option value="suspended">
            Suspended
          </option>
        </select>
      </div>

      <div className="customers-table-card">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Phone Verified</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="customers-empty"
                >
                  No customers match your search.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(
                (customer) => (
                  <tr
                    key={customer.id}
                  >
                    <td>
                      <Link
                        to={`/customers/${customer.id}`}
                        className="customer-name-link"
                      >
                        {customer.fullName ||
                          "Unnamed Customer"}
                      </Link>
                    </td>

                    <td>
                      {customer.email || "—"}
                    </td>

                    <td>
                      {customer.phoneNumber ||
                        "—"}
                    </td>

                    <td>
                      {customer.phoneVerified
                        ? "Verified"
                        : "Not verified"}
                    </td>

                    <td>
                      <span
                        className={`customer-status customer-status-${customer.status}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Customers;