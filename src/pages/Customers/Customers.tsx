import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import { getCustomers } from '../../services/firebase/customers/customers.services';

import type { Customer } from '../../services/firebase/customers/customers.types';

import './Customers.css';

function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');

      const customerList =
        await getCustomers();

      setCustomers(customerList);
    } catch (error) {
      console.error(
        'Failed to load customers:',
        error,
      );

      setError(
        'Failed to load customers. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

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
          {customers.length} customer
          {customers.length !== 1
            ? 's'
            : ''}
        </span>
      </div>

      <div className="customers-table-card">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Customer ID</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="customers-empty"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map(
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
                          'Unnamed Customer'}
                      </Link>
                    </td>

                    <td>
                      {customer.phoneNumber ||
                        '—'}
                    </td>

                    <td>
                      <span
                        className={`customer-status customer-status-${customer.status}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <span className="customer-id">
                        {customer.id}
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