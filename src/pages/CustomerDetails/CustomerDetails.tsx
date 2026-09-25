import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomer,
  getCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomer,
  updateCustomerAddress,
  updateCustomerStatus,
} from '../../services/firebase/customers/customers.services';

import type {
  Customer,
  CustomerAddress,
  CustomerStatus,
} from "../../services/firebase/customers/customers.types";

import {
  getCustomerPickups,
} from "../../services/firebase/customers/customer-pickups.services";

import type {
  Pickup,
} from "../../services/firebase/pickups/pickup.types";

import './CustomerDetails.css';

interface AddressFormState {
  label: string;
  address: string;
  latitude: string;
  longitude: string;
  isDefault: boolean;
}

interface CustomerFormState {
  fullName: string;
}

const emptyAddressForm: AddressFormState = {
  label: '',
  address: '',
  latitude: '',
  longitude: '',
  isDefault: false,
};

const emptyCustomerForm: CustomerFormState = {
  fullName: '',
};

function CustomerDetails() {
  const { customerId } = useParams();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [addresses, setAddresses] =
    useState<CustomerAddress[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);

  const [addressForm, setAddressForm] =
    useState<AddressFormState>(
      emptyAddressForm,
    );

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [addressFormError, setAddressFormError] =
    useState('');

  const [addressActionId, setAddressActionId] =
    useState<string | null>(null);

  const [showCustomerForm, setShowCustomerForm] =
    useState(false);

  const [customerForm, setCustomerForm] =
    useState<CustomerFormState>(
      emptyCustomerForm,
    );

  const [savingCustomer, setSavingCustomer] =
    useState(false);

  const [customerFormError, setCustomerFormError] =
    useState('');  

  const [pickups, setPickups] =
    useState<Pickup[]>([]);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  function openCustomerForm() {
    if (!customer) {
        return;
    }

    setCustomerForm({
      fullName: customer.fullName,
    });

      setCustomerFormError('');
      setShowCustomerForm(true);
    }

  function closeCustomerForm() {
    if (savingCustomer) {
        return;
    }

      setShowCustomerForm(false);
      setCustomerFormError('');
      setCustomerForm(
        emptyCustomerForm,
    );
  }   
  
  async function handleSaveCustomer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!customerId || !customer) {
      return;
    }

    setCustomerFormError('');

    const fullName =
      customerForm.fullName.trim();

    if (!fullName) {
      setCustomerFormError(
        'Customer name is required.',
      );
      return;
    }

    try {
      setSavingCustomer(true);

      await updateCustomer(
        customerId,
        fullName,
      );

      const updatedCustomer =
        await getCustomer(
          customerId,
        );

      if (updatedCustomer) {
        setCustomer(updatedCustomer);
      }

      setShowCustomerForm(false);
      setCustomerFormError('');
      setCustomerForm(
        emptyCustomerForm,
      );
    } catch (error) {
      console.error(
        'Failed to update customer:',
        error,
      );

      if (error instanceof Error) {
        setCustomerFormError(
          error.message,
        );
      } else {
        setCustomerFormError(
          'Failed to update customer. Please try again.',
        );
      }
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleCustomerStatusChange(
      status: CustomerStatus,
    ) {
      if (!customer) {
        return;
      }

      const action =
        status === "active"
          ? "reactivate"
          : status === "suspended"
            ? "suspend"
            : "deactivate";

      const confirmed = window.confirm(
        `Are you sure you want to ${action} ${customer.fullName}?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingStatus(true);
        setError("");

        await updateCustomerStatus(
          customer.id,
          status,
        );

        setCustomer({
          ...customer,
          status,
        });
      } catch (err) {
        console.error(
          "Failed to update customer status:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to update customer status.",
        );
      } finally {
        setUpdatingStatus(false);
      }
    }

  async function loadCustomer() {
    if (!customerId) {
      setError(
        'Customer ID is missing.',
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

    const [
      customerData,
      addressList,
      pickupList,
    ] = await Promise.all([
      getCustomer(customerId),
      getCustomerAddresses(customerId),
      getCustomerPickups(customerId),
    ]);

      if (!customerData) {
        setError(
          'Customer not found.',
        );
        setCustomer(null);
        setAddresses([]);
        return;
      }

      setCustomer(customerData);
      setAddresses(addressList);
      setPickups(pickupList);
    } catch (error) {
      console.error(
        'Failed to load customer:',
        error,
      );

      setError(
        'Failed to load customer. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  function openAddAddressForm() {
    setEditingAddressId(null);
    setAddressForm(
      emptyAddressForm,
    );
    setAddressFormError('');
    setShowAddressForm(true);
  }

  function openEditAddressForm(
    address: CustomerAddress,
  ) {
    setEditingAddressId(
      address.id,
    );

    setAddressForm({
      label: address.label,
      address: address.address,
      latitude:
        String(address.latitude),
      longitude:
        String(address.longitude),
      isDefault:
        address.isDefault,
    });

    setAddressFormError('');
    setShowAddressForm(true);
  }

  function closeAddressForm() {
    if (savingAddress) {
      return;
    }

    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm(
      emptyAddressForm,
    );
    setAddressFormError('');
  }

  async function handleSaveAddress(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!customerId) {
      return;
    }

    setAddressFormError('');

    const label =
      addressForm.label.trim();

    const address =
      addressForm.address.trim();

    const latitude =
      Number(addressForm.latitude);

    const longitude =
      Number(addressForm.longitude);

    if (!label) {
      setAddressFormError(
        'Address label is required.',
      );
      return;
    }

    if (!address) {
      setAddressFormError(
        'Address is required.',
      );
      return;
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setAddressFormError(
        'Latitude must be between -90 and 90.',
      );
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setAddressFormError(
        'Longitude must be between -180 and 180.',
      );
      return;
    }

    try {
      setSavingAddress(true);

      if (editingAddressId) {
        await updateCustomerAddress(
          customerId,
          editingAddressId,
          label,
          address,
          latitude,
          longitude,
          addressForm.isDefault,
        );
      } else {
        await createCustomerAddress(
          customerId,
          label,
          address,
          latitude,
          longitude,
          addressForm.isDefault,
        );
      }

      const updatedAddresses =
        await getCustomerAddresses(
          customerId,
        );

      setAddresses(
        updatedAddresses,
      );

      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(
        emptyAddressForm,
      );
    } catch (error) {
      console.error(
        'Failed to save customer address:',
        error,
      );

      if (
        error instanceof Error
      ) {
        setAddressFormError(
          error.message,
        );
      } else {
        setAddressFormError(
          'Failed to save address. Please try again.',
        );
      }
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSetDefaultAddress(
    addressId: string,
  ) {
    if (!customerId) {
      return;
    }

    try {
      setAddressActionId(
        addressId,
      );

      await setDefaultCustomerAddress(
        customerId,
        addressId,
      );

      const updatedAddresses =
        await getCustomerAddresses(
          customerId,
        );

      setAddresses(
        updatedAddresses,
      );
    } catch (error) {
      console.error(
        'Failed to set default address:',
        error,
      );

      window.alert(
        'Failed to set default address. Please try again.',
      );
    } finally {
      setAddressActionId(null);
    }
  }

  async function handleDeleteAddress(
    addressId: string,
  ) {
    if (!customerId) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this address?',
      );

    if (!confirmed) {
      return;
    }

    try {
      setAddressActionId(
        addressId,
      );

      await deleteCustomerAddress(
        customerId,
        addressId,
      );

      setAddresses(
        (currentAddresses) =>
          currentAddresses.filter(
            (address) =>
              address.id !==
              addressId,
          ),
      );
    } catch (error) {
      console.error(
        'Failed to delete customer address:',
        error,
      );

      window.alert(
        'Failed to delete address. Please try again.',
      );
    } finally {
      setAddressActionId(null);
    }
  }

  if (loading) {
    return (
      <section className="customer-details-page">
        <div className="customer-details-state">
          Loading customer...
        </div>
      </section>
    );
  }

  if (error || !customer) {
    return (
      <section className="customer-details-page">
        <Link
          to="/customers"
          className="customer-details-back"
        >
          ← Back to Customers
        </Link>

        <div className="customer-details-state customer-details-error">
          {error || 'Customer not found.'}
        </div>
      </section>
    );
  }

  return (
    <section className="customer-details-page">
      <div className="customer-details-header">
        <div>
          <Link
            to="/customers"
            className="customer-details-back"
          >
            ← Back to Customers
          </Link>

          <h1>
            {customer.fullName ||
              'Unnamed Customer'}
          </h1>

          <p>
            Customer information and
            pickup addresses.
          </p>
        </div>
      </div>

      <div className="customer-details-grid">
        <div className="customer-details-card">
        <div className="customer-card-title-row">
            <h2>
            Customer Information
            </h2>

            <button
            type="button"
            className="customer-edit-button"
            onClick={
                openCustomerForm
            }
            >
            Edit Customer
            </button>
        </div>

        {showCustomerForm && (
        <div className="customer-form-card">
            <div className="customer-form-header">
            <div>
                <h3>
                Edit Customer
                </h3>

                <p>
                Update customer information
                and account status.
                </p>
            </div>

            <button
                type="button"
                className="customer-form-close-button"
                onClick={
                closeCustomerForm
                }
                disabled={
                savingCustomer
                }
                aria-label="Close customer form"
            >
                ×
            </button>
            </div>

            <form
            className="customer-form"
            onSubmit={
                handleSaveCustomer
            }
            >
            <div className="customer-form-field">
                <label htmlFor="customerFullName">
                Full Name
                </label>

                <input
                id="customerFullName"
                type="text"
                value={
                    customerForm.fullName
                }
                onChange={(
                    event,
                ) =>
                    setCustomerForm(
                    (current) => ({
                        ...current,
                        fullName:
                        event.target
                            .value,
                    }),
                    )
                }
                placeholder="Customer name"
                disabled={
                    savingCustomer
                }
                />
            </div>



            {customerFormError && (
                <div className="customer-form-error">
                {customerFormError}
                </div>
            )}

            <div className="customer-form-actions">
                <button
                type="button"
                className="customer-form-cancel-button"
                onClick={
                    closeCustomerForm
                }
                disabled={
                    savingCustomer
                }
                >
                Cancel
                </button>

                <button
                type="submit"
                className="customer-form-save-button"
                disabled={
                    savingCustomer
                }
                >
                {savingCustomer
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>
            </div>
            </form>
        </div>
        )}

          <div className="customer-detail-row">
            <span>Name</span>

            <strong>
              {customer.fullName ||
                '—'}
            </strong>
          </div>

          <div className="customer-detail-row">
            <span>Phone Number</span>

            <strong>
              {customer.phoneNumber ||
                '—'}
            </strong>
          </div>

          <div className="customer-detail-row">
            <span>Email</span>

            <strong>
              {customer.email || '—'}
            </strong>
          </div>

          <div className="customer-detail-row">
            <span>Phone Verification</span>

            <strong>
              {customer.phoneVerified
                ? 'Verified'
                : 'Not verified'}
            </strong>
          </div>

          <div className="customer-detail-row">
            <span>Onboarding</span>

            <strong>
              {customer.onboardingCompleted
                ? 'Completed'
                : 'Incomplete'}
            </strong>
          </div>

          <div className="customer-detail-row">
            <span>Status</span>

            <span
              className={`customer-status customer-status-${customer.status}`}
            >
              {customer.status}
            </span>
          </div>

          <div className="customer-detail-row">
            <span>Customer ID</span>

            <strong className="customer-id">
              {customer.id}
            </strong>
          </div>
        </div>

        <div className="customer-status-actions">
          <h3>Account Status</h3>

          <p>
            Changing the account status also controls
            whether the customer can authenticate.
          </p>

          <div className="customer-status-buttons">
            {customer.status === 'active' && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    void handleCustomerStatusChange(
                      'suspended',
                    )
                  }
                  disabled={updatingStatus}
                >
                  {updatingStatus
                    ? 'Updating...'
                    : 'Suspend Customer'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleCustomerStatusChange(
                      'inactive',
                    )
                  }
                  disabled={updatingStatus}
                >
                  Deactivate Customer
                </button>
              </>
            )}

            {customer.status !== 'active' && (
              <button
                type="button"
                onClick={() =>
                  void handleCustomerStatusChange(
                    'active',
                  )
                }
                disabled={updatingStatus}
              >
                {updatingStatus
                  ? 'Updating...'
                  : 'Reactivate Customer'}
              </button>
            )}
          </div>
        </div>

        <div className="customer-details-card">
          <div className="customer-address-title-row">
            <div>
              <h2>
                Pickup Addresses
              </h2>

              <div className="customer-address-count">
                {addresses.length}{' '}
                address
                {addresses.length !== 1
                  ? 'es'
                  : ''}
              </div>
            </div>

            <button
              type="button"
              className="customer-add-address-button"
              onClick={
                openAddAddressForm
              }
            >
              + Add Address
            </button>
          </div>

          {showAddressForm && (
            <div className="customer-address-form-card">
              <div className="customer-address-form-header">
                <div>
                  <h3>
                    {editingAddressId
                      ? 'Edit Address'
                      : 'Add Address'}
                  </h3>

                  <p>
                    Enter the customer's
                    pickup location.
                  </p>
                </div>

                <button
                  type="button"
                  className="customer-address-close-button"
                  onClick={
                    closeAddressForm
                  }
                  disabled={
                    savingAddress
                  }
                  aria-label="Close address form"
                >
                  ×
                </button>
              </div>

              <form
                className="customer-address-form"
                onSubmit={
                  handleSaveAddress
                }
              >
                <div className="customer-address-form-field">
                  <label htmlFor="addressLabel">
                    Label
                  </label>

                  <input
                    id="addressLabel"
                    type="text"
                    value={
                      addressForm.label
                    }
                    onChange={(
                      event,
                    ) =>
                      setAddressForm(
                        (current) => ({
                          ...current,
                          label:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Home"
                    disabled={
                      savingAddress
                    }
                  />
                </div>

                <div className="customer-address-form-field">
                  <label htmlFor="addressText">
                    Address
                  </label>

                  <textarea
                    id="addressText"
                    value={
                      addressForm.address
                    }
                    onChange={(
                      event,
                    ) =>
                      setAddressForm(
                        (current) => ({
                          ...current,
                          address:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="Complete pickup address"
                    rows={3}
                    disabled={
                      savingAddress
                    }
                  />
                </div>

                <div className="customer-address-coordinate-grid">
                  <div className="customer-address-form-field">
                    <label htmlFor="latitude">
                      Latitude
                    </label>

                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      value={
                        addressForm.latitude
                      }
                      onChange={(
                        event,
                      ) =>
                        setAddressForm(
                          (current) => ({
                            ...current,
                            latitude:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="8.228000"
                      disabled={
                        savingAddress
                      }
                    />
                  </div>

                  <div className="customer-address-form-field">
                    <label htmlFor="longitude">
                      Longitude
                    </label>

                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      value={
                        addressForm.longitude
                      }
                      onChange={(
                        event,
                      ) =>
                        setAddressForm(
                          (current) => ({
                            ...current,
                            longitude:
                              event.target
                                .value,
                          }),
                        )
                      }
                      placeholder="124.245200"
                      disabled={
                        savingAddress
                      }
                    />
                  </div>
                </div>

                <label className="customer-default-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      addressForm.isDefault
                    }
                    onChange={(
                      event,
                    ) =>
                      setAddressForm(
                        (current) => ({
                          ...current,
                          isDefault:
                            event.target
                              .checked,
                        }),
                      )
                    }
                    disabled={
                      savingAddress
                    }
                  />

                  <span>
                    Set as default pickup
                    address
                  </span>
                </label>

                {addressFormError && (
                  <div className="customer-address-form-error">
                    {addressFormError}
                  </div>
                )}

                <div className="customer-address-form-actions">
                  <button
                    type="button"
                    className="customer-address-cancel-button"
                    onClick={
                      closeAddressForm
                    }
                    disabled={
                      savingAddress
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="customer-address-save-button"
                    disabled={
                      savingAddress
                    }
                  >
                    {savingAddress
                      ? 'Saving...'
                      : editingAddressId
                        ? 'Save Changes'
                        : 'Add Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="customer-address-empty">
              No pickup addresses found.
            </div>
          ) : (
            <div className="customer-address-list">
              {addresses.map(
                (address) => (
                  <div
                    key={address.id}
                    className="customer-address"
                  >
                    <div className="customer-address-header">
                      <div>
                        <strong>
                          {address.label ||
                            'Address'}
                        </strong>

                        {address.isDefault && (
                          <span className="customer-default-badge">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    <p>
                      {address.address ||
                        'No address provided.'}
                    </p>

                    <div className="customer-address-coordinates">
                      <span>
                        Latitude:{' '}
                        {address.latitude.toFixed(
                          6,
                        )}
                      </span>

                      <span>
                        Longitude:{' '}
                        {address.longitude.toFixed(
                          6,
                        )}
                      </span>
                    </div>

                    <div className="customer-address-actions">
                      {!address.isDefault && (
                        <button
                          type="button"
                          className="customer-address-action"
                          onClick={() =>
                            handleSetDefaultAddress(
                              address.id,
                            )
                          }
                          disabled={
                            addressActionId ===
                            address.id
                          }
                        >
                          Set Default
                        </button>
                      )}

                      <button
                        type="button"
                        className="customer-address-action"
                        onClick={() =>
                          openEditAddressForm(
                            address,
                          )
                        }
                        disabled={
                          addressActionId ===
                          address.id
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="customer-address-action customer-address-delete"
                        onClick={() =>
                          handleDeleteAddress(
                            address.id,
                          )
                        }
                        disabled={
                          addressActionId ===
                          address.id
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="customer-details-card customer-pickups-card">
          <div className="customer-address-title-row">
            <div>
              <h2>Pickup History</h2>

              <span className="customer-address-count">
                {pickups.length} pickup
                {pickups.length !== 1
                  ? 's'
                  : ''}
              </span>
            </div>
          </div>

          {pickups.length === 0 ? (
            <div className="customer-address-empty">
              No pickup history found.
            </div>
          ) : (
            <div className="customer-pickup-list">
              {pickups.map((pickup) => (
                <Link
                  key={pickup.id}
                  to={`/pickups/${pickup.id}`}
                  className="customer-pickup-item"
                >
                  <div>
                    <strong>
                      {pickup.scheduledDate}
                    </strong>

                    <span>
                      {pickup.scheduledTime}
                    </span>
                  </div>

                  <div>
                    <span>
                      Estimated:{' '}
                      {pickup.estimatedWeight} kg
                    </span>

                    {pickup.actualWeight !== null && (
                      <span>
                        Actual:{' '}
                        {pickup.actualWeight} kg
                      </span>
                    )}
                  </div>

                  <span
                    className={`customer-status customer-status-${pickup.status}`}
                  >
                    {pickup.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CustomerDetails;