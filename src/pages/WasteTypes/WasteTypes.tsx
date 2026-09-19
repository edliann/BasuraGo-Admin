import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  createWasteType,
  getWasteTypes,
  updateWasteType,
  updateWasteTypeStatus,
} from '../../services/firebase/waste-types/waste-types.service';

import type {
  WasteType,
} from '../../services/firebase/waste-types/waste-type.types';

import './WasteTypes.css';

function WasteTypes() {
  const [wasteTypes, setWasteTypes] =
    useState<WasteType[]>([]);

  const [name, setName] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [editingWasteTypeId, setEditingWasteTypeId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState('');

  const [editDescription, setEditDescription] =
    useState('');

  const [updating, setUpdating] =
    useState(false);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<string | null>(null);

  async function loadWasteTypes() {
    try {
      setLoading(true);
      setError('');

      const data =
        await getWasteTypes();

      setWasteTypes(data);
    } catch (err) {
      console.error(
        'Failed to load waste types:',
        err,
      );

      setError(
        'Failed to load waste types.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWasteTypes();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();

    if (!trimmedName) {
      setError(
        'Waste type name is required.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createWasteType(
        trimmedName,
        trimmedDescription,
      );

      setName('');
      setDescription('');

      await loadWasteTypes();

      setSuccess(
        'Waste type created successfully.',
      );
    } catch (err) {
      console.error(
        'Failed to create waste type:',
        err,
      );

      setError(
        'Failed to create waste type.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditStart(
    wasteType: WasteType,
    ) {
    setEditingWasteTypeId(
        wasteType.id,
    );

    setEditName(
        wasteType.name,
    );

    setEditDescription(
        wasteType.description,
    );

    setError('');
    setSuccess('');
    }

    function handleEditCancel() {
    setEditingWasteTypeId(null);
    setEditName('');
    setEditDescription('');
    }

    async function handleEditSave() {
    if (!editingWasteTypeId) {
        return;
    }

    const trimmedName =
        editName.trim();

    const trimmedDescription =
        editDescription.trim();

    if (!trimmedName) {
        setError(
        'Waste type name is required.',
        );
        return;
    }

    try {
        setUpdating(true);
        setError('');
        setSuccess('');

        await updateWasteType(
        editingWasteTypeId,
        trimmedName,
        trimmedDescription,
        );

        await loadWasteTypes();

        handleEditCancel();

        setSuccess(
        'Waste type updated successfully.',
        );
    } catch (err) {
        console.error(
        'Failed to update waste type:',
        err,
        );

        setError(
        'Failed to update waste type.',
        );
    } finally {
        setUpdating(false);
    }
    }

    async function handleStatusToggle(
    wasteType: WasteType,
    ) {
    const nextStatus =
        wasteType.status === 'active'
        ? 'inactive'
        : 'active';

    const action =
        nextStatus === 'active'
        ? 'activate'
        : 'deactivate';

    const confirmed =
        window.confirm(
        `Are you sure you want to ${action} "${wasteType.name}"?`,
        );

    if (!confirmed) {
        return;
    }

    try {
        setUpdatingStatusId(
        wasteType.id,
        );

        setError('');
        setSuccess('');

        await updateWasteTypeStatus(
        wasteType.id,
        nextStatus,
        );

        await loadWasteTypes();

        setSuccess(
        `Waste type ${nextStatus} successfully.`,
        );
    } catch (err) {
        console.error(
        'Failed to update waste type status:',
        err,
        );

        setError(
        'Failed to update waste type status.',
        );
    } finally {
        setUpdatingStatusId(null);
    }
    }    
  return (
    <section className="waste-types-page">
      <div className="waste-types-header">
        <div>
          <h1>Waste Types</h1>

          <p>
            Manage the types of waste
            accepted by BasuraGo.
          </p>
        </div>
      </div>

      <div className="waste-types-content">
        <div className="waste-types-card">
          <h2>Add Waste Type</h2>

          <form
            className="waste-types-form"
            onSubmit={handleSubmit}
          >
            <div className="waste-types-field">
              <label htmlFor="waste-type-name">
                Name
              </label>

              <input
                id="waste-type-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="e.g. General Waste"
                disabled={saving}
              />
            </div>

            <div className="waste-types-field">
              <label htmlFor="waste-type-description">
                Description
              </label>

              <textarea
                id="waste-type-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Describe this waste type"
                rows={4}
                disabled={saving}
              />
            </div>

            {error && (
              <p className="waste-types-message waste-types-error">
                {error}
              </p>
            )}

            {success && (
              <p className="waste-types-message waste-types-success">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Creating...'
                : 'Add Waste Type'}
            </button>
          </form>
        </div>

        <div className="waste-types-card">
          <div className="waste-types-list-header">
            <h2>Waste Types</h2>

            <span>
              {wasteTypes.length} total
            </span>
          </div>

          {loading ? (
            <div className="waste-types-state">
              Loading waste types...
            </div>
          ) : wasteTypes.length === 0 ? (
            <div className="waste-types-state">
              No waste types found.
            </div>
          ) : (
            <div className="waste-types-table-container">
              <table className="waste-types-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {wasteTypes.map((wasteType) => {
                    const isEditing =
                    editingWasteTypeId ===
                    wasteType.id;

                    return (
                    <tr key={wasteType.id}>
                        <td>
                        {isEditing ? (
                            <input
                            className="waste-type-edit-input"
                            type="text"
                            value={editName}
                            onChange={(event) =>
                                setEditName(
                                event.target.value,
                                )
                            }
                            disabled={updating}
                            />
                        ) : (
                            <strong>
                            {wasteType.name}
                            </strong>
                        )}
                        </td>

                        <td>
                        {isEditing ? (
                            <textarea
                            className="waste-type-edit-textarea"
                            value={editDescription}
                            onChange={(event) =>
                                setEditDescription(
                                event.target.value,
                                )
                            }
                            rows={2}
                            disabled={updating}
                            />
                        ) : (
                            wasteType.description ||
                            'No description'
                        )}
                        </td>

                        <td>
                        <span
                            className={`waste-type-status waste-type-status-${wasteType.status}`}
                        >
                            {wasteType.status}
                        </span>
                        </td>

                        <td>
                        {isEditing ? (
                            <div className="waste-type-actions">
                            <button
                                type="button"
                                className="waste-type-action-save"
                                onClick={handleEditSave}
                                disabled={updating}
                            >
                                {updating
                                ? 'Saving...'
                                : 'Save'}
                            </button>

                            <button
                                type="button"
                                className="waste-type-action-cancel"
                                onClick={handleEditCancel}
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            </div>
                        ) : (
                            <div className="waste-type-actions">
                            <button
                                type="button"
                                className="waste-type-action-edit"
                                onClick={() =>
                                handleEditStart(
                                    wasteType,
                                )
                                }
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className={
                                wasteType.status === 'active'
                                    ? 'waste-type-action-deactivate'
                                    : 'waste-type-action-activate'
                                }
                                onClick={() =>
                                handleStatusToggle(
                                    wasteType,
                                )
                                }
                                disabled={
                                updatingStatusId ===
                                wasteType.id
                                }
                            >
                                {updatingStatusId ===
                                wasteType.id
                                ? 'Updating...'
                                : wasteType.status === 'active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                            </button>
                            </div>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WasteTypes;