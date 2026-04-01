'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addNote, removeNote, updateNote as updateStoredNote } from '@/store/notes-slice';
import { getCategories } from '@/store/notes-slice';
import { NOTE_CATEGORIES, type Note, type NoteCategory } from '@/lib/api';
import { createNoteRequest, updateNoteRequest, deleteNoteRequest } from '@/services/note';
import { CloseIcon, SaveIcon, TrashIcon } from '@/components/notes/ui';
import Select from '@/components/form/Select';
import { Button } from '../Button';
import { hexToRgba } from '@/lib/utils';

type NoteDraft = {
  title: string;
  content: string;
  category: NoteCategory;
};

const schema = yup.object({
  title: yup.string().trim().required('Give the note a title.'),
  content: yup.string().trim().required('Write something down in the content.'),
  category: yup
    .mixed<NoteCategory>()
    .oneOf(NOTE_CATEGORIES as readonly NoteCategory[])
    .required('Choose a category.'),
});

const NoteModal: React.FC<{
  isResolvingNote: boolean;
  routeNoteId: string;
  onClose: () => void;
  onCreated?: (note: Note) => void;
}> = ({ isResolvingNote, routeNoteId, onClose, onCreated }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const categories = useAppSelector(getCategories);
  const notes = useAppSelector((s) => s.notes.items);
  const dispatch = useAppDispatch();
  const isNew = routeNoteId === 'new';

  const activeNote =
    routeNoteId && routeNoteId !== 'new' ? (notes.find((n) => String(n.id) === routeNoteId) ?? null) : null;

  const { register, handleSubmit, setValue, watch, formState, reset } = useForm<NoteDraft>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      category: 'Random Thoughts' as NoteCategory,
    },
  });

  useEffect(() => {
    if (isNew) {
      reset({ title: '', content: '', category: 'Random Thoughts' as NoteCategory });
    } else if (activeNote) {
      reset({ title: activeNote.title, content: activeNote.content, category: activeNote.category });
    }
  }, [isNew, activeNote]);

  const confirmClose = useCallback(() => {
    if (formState.isDirty) {
      if (!window.confirm('You have unsaved changes. Discard them and close?')) return;
    }

    onClose();
  }, [formState.isDirty, onClose]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') confirmClose();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        const root = modalRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const appMain = document.getElementById('app-main');
    if (appMain) appMain.setAttribute('aria-hidden', 'true');

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const root = modalRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length) focusable[0].focus();
    }, 0);

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleKeyDown);
      if (appMain) appMain.removeAttribute('aria-hidden');
      document.body.style.overflow = prevOverflow;
      try {
        previouslyFocused.current?.focus();
      } catch {}
    };
  }, [onClose]);

  async function onSubmit(values: NoteDraft) {
    try {
      if (isNew) {
        const created = await createNoteRequest({
          title: values.title.trim(),
          content: values.content.trim(),
          category: values.category,
        });
        dispatch(addNote(created as Note));
        onCreated?.(created as Note);
      } else {
        if (!activeNote) throw new Error('Note not found');
        const updated = await updateNoteRequest(activeNote.id, {
          title: values.title.trim(),
          content: values.content.trim(),
          category: values.category,
        });
        dispatch(updateStoredNote(updated as Note));
        onClose();
      }
    } catch (err) {
      // let parent show errors via onSaved side-effects if desired
      alert('An error occurred while saving the note. Please try again.');
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!activeNote) return;
    if (!window.confirm('Delete this note? You can’t undo this action.')) return;
    try {
      await deleteNoteRequest(activeNote.id);
      dispatch(removeNote(activeNote.id));
      onClose();
    } catch (err) {
      console.error(err);
    }
  }
  const selectedCategory = watch('category');

  const selectedMeta = categories.find((c) => c.value === selectedCategory) ?? categories[0];

  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-background"
    >
      <div className="surface-panel relative z-10 flex w-full h-full flex-col overflow-hidden">
        <div className="px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-4">
            <Select
              value={selectedCategory}
              onChange={(v) => setValue('category', v as NoteCategory)}
              className="w-3xs"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                    <span>{category.label}</span>
                  </div>
                </option>
              ))}
            </Select>

            <button
              type="button"
              className="btn-base btn-secondary h-11! w-11! rounded-full! p-0!"
              onClick={confirmClose}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {isResolvingNote ? (
          <div className="p-5 md:p-7">
            <div className="rounded-[26px] bg-white/55 p-6">
              <p className="text-lg font-semibold text-ink">Loading note...</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">
                Pulling the latest version from your board.
              </p>
            </div>
          </div>
        ) : routeNoteId !== 'new' && !activeNote ? (
          <div className="p-5 md:p-7">
            <div className="rounded-[26px] bg-white/55 p-6">
              <p className="text-lg font-semibold text-ink">This note is gone.</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">
                It may have been deleted, or it might belong to another user. Head back to the board and open another
                note.
              </p>
              <button className="btn-base btn-primary mt-5" type="button" onClick={onClose}>
                Return to dashboard
              </button>
            </div>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col px-5" onSubmit={handleSubmit(onSubmit)}>
            <div
              className="soft-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6 border-2 rounded-2xl"
              style={{
                borderColor: selectedMeta?.color,
                backgroundColor: hexToRgba(selectedMeta?.color ?? '#ffffff', 0.06),
              }}
            >
              {activeNote && (
                <div className="text-sm leading-6 text-ink-soft text-right">
                  Last edited: {formatDate(activeNote.last_edited_at)}
                </div>
              )}
              <div className="grid gap-5">
                <div className="space-y-5">
                  <input
                    id="note-title"
                    {...register('title')}
                    className="w-full bg-transparent border-0 p-0 text-[24px]! font-bold tracking-tight placeholder:text-ink-soft focus:ring-0 focus:outline-none"
                    placeholder="Note Title"
                  />
                  {formState.errors.title ? (
                    <div className="mt-5 text-sm text-red-600">{formState.errors.title.message}</div>
                  ) : null}

                  {formState.errors.content ? (
                    <div className="mt-5 text-sm text-red-600">{formState.errors.content.message}</div>
                  ) : null}
                  <textarea
                    id="note-content"
                    {...register('content')}
                    className="w-full bg-transparent border-0 p-0 text-sm leading-6 min-h-70 resize-none placeholder:text-ink-soft focus:ring-0 focus:outline-none"
                    placeholder="Write everything down here..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border bg-white/28 px-5 py-4 md:flex-row md:items-center justify-end md:px-7">
              <div className="flex flex-wrap items-center gap-3">
                {!isNew ? (
                  <Button variant="text" type="button" onClick={handleDelete} disabled={formState.isSubmitting}>
                    <TrashIcon />
                    Delete
                  </Button>
                ) : null}
                <Button type="button" disabled={formState.isSubmitting} onClick={confirmClose}>
                  Cancel
                </Button>
                <Button variant="contained" disabled={formState.isSubmitting} leftIcon={<SaveIcon />}>
                  {formState.isSubmitting ? 'Saving...' : isNew ? 'Create Note' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(modal, document.body);
};

export default NoteModal;
