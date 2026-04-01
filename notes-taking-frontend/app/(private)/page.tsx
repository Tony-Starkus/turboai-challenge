'use client';

import { type CSSProperties, useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { type Note, type NoteCategory } from '@/lib/api';
import { formatTinyDate, joinClasses } from '@/components/notes/ui';
import { useAppSelector } from '@/store/hooks';
import { getCategories, getNotes, getNotesStatus, getNotesError } from '@/store/notes-slice';
import Image from 'next/image';
import NoteModal from '@/components/notes/NoteModal';
import { hexToRgba } from '@/lib/utils';

type CategoryFilter = 'All' | NoteCategory;

const categoryDetails: Record<
  NoteCategory,
  {
    tone: string;
    tagline: string;
    hint: string;
  }
> = {
  'Random Thoughts': {
    tone: 'coral',
    tagline: 'Loose sparks and half-shaped ideas.',
    hint: 'Keep the ideas that show up out of nowhere.',
  },
  School: {
    tone: 'yellow',
    tagline: 'Homework, references, and class notes.',
    hint: 'A calmer place for deadlines and study sessions.',
  },
  Personal: {
    tone: 'sage',
    tagline: 'Life admin, journals, and everyday stuff.',
    hint: 'Private plans, reminders, and reflection.',
  },
};

export function DashboardRoutePage({ routeNoteId = null }: { routeNoteId?: string | null }) {
  const router = useRouter();
  const categories = useAppSelector(getCategories);
  const notes = useAppSelector(getNotes);
  const notesStatus = useAppSelector(getNotesStatus);
  const notesError = useAppSelector(getNotesError);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');
  const [isRouting, startRouting] = useTransition();

  const visibleNotes = notes.filter((note) => {
    const matchesCategory = activeFilter === 'All' || note.category === activeFilter;

    return matchesCategory;
  });

  const activeNote =
    routeNoteId && routeNoteId !== 'new' ? (notes.find((item) => String(item.id) === routeNoteId) ?? null) : null;

  function openExistingNote(noteId: number) {
    startRouting(() => {
      router.push(`/note/${noteId}`);
    });
  }

  const closeNoteModal = useCallback(() => {
    startRouting(() => {
      router.push('/');
    });
  }, [router, startRouting]);

  return (
    <div id="app-main" className="grid flex-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="p-5 md:p-6">
        <div>
          <p
            className="mt-3 font-semibold tracking-tight text-ink cursor-pointer"
            onClick={() => setActiveFilter('All')}
          >
            All categories
          </p>
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={joinClasses(
                'mt-4 flex w-full p-2 items-start gap-3 rounded-[22px] border text-left transition duration-200 cursor-pointer',
                activeFilter === category.value
                  ? 'border-border-strong bg-white/80 shadow-[0_14px_26px_rgba(68,49,31,0.08)]'
                  : 'border-transparent  hover:border-border hover:bg-white/60',
              )}
              onClick={() => setActiveFilter(category.value)}
            >
              <div className="h-4 w-4 rounded-full self-center" style={{ backgroundColor: category.color }} />
              <div className="flex-1 flex justify-between items-center">
                <p className="font-semibold text-ink">{category.label}</p>
                <p>{category.count}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section>
        {notesStatus === 'error' ? (
          <div className="mt-6 rounded-[28px] border border-[rgba(167,77,45,0.18)] bg-[rgba(239,156,102,0.18)] p-5">
            <p className="font-semibold text-ink">We couldn’t load your notes.</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{notesError}</p>
          </div>
        ) : null}

        {notesStatus === 'loading' && notes.length === 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-52.5 animate-pulse rounded-[28px] bg-white/35" />
            ))}
          </div>
        ) : visibleNotes.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleNotes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} onOpen={() => openExistingNote(note.id)} />
            ))}
          </div>
        ) : (
          <EmptyBoard />
        )}
      </section>

      {routeNoteId ? (
        <NoteModal
          isResolvingNote={routeNoteId !== 'new' && notesStatus === 'loading' && !activeNote}
          routeNoteId={routeNoteId}
          onClose={closeNoteModal}
          onCreated={(savedNote: Note) => {
            startRouting(() => {
              router.replace(`/note/${savedNote.id}`);
            });
          }}
        />
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return <DashboardRoutePage />;
}

const NoteCard: React.FC<{ note: Note; index: number; onOpen: () => void }> = ({ note, index, onOpen }) => {
  const rotation = getNoteTilt(index);
  const category = categoryDetails[note.category];

  const categories = useAppSelector(getCategories);
  const catMeta = categories.find((c) => c.value === note.category) ?? null;

  return (
    <button
      type="button"
      className="sticky-note flex min-h-55 flex-col text-left cursor-pointer"
      data-tone={category.tone}
      onClick={onOpen}
      style={
        {
          '--note-tilt': rotation,
          border: `2px solid ${catMeta?.color ?? 'transparent'}`,
          backgroundColor: hexToRgba(catMeta?.color ?? '#ffffff', 0.06),
        } as CSSProperties
      }
    >
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold! text-black">{formatTinyDate(note.last_edited_at)}</span>
        <span className="text-xs">{note.category}</span>
      </div>

      <div className="mt-5">
        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight text-[rgba(25,20,15,0.9)]">
          <span className="font-hand text-[1.45rem] leading-none">{note.title}</span>
        </h3>
        <p className="mt-3 line-clamp-5 break-all text-sm leading-6 text-[rgba(36,29,22,0.72)]">{note.content}</p>
      </div>
    </button>
  );
};

const EmptyBoard = () => {
  return (
    <div>
      <Image src="/assets/images/coffee.png" alt="Coffee" width={400} height={400} className="block m-auto" />
      <h3 className="mx-auto mt-3 max-w-xl text-center text-2xl leading-7 text-caramel">
        I&apos;m just here waiting for your charming notes...
      </h3>
    </div>
  );
};

const getNoteTilt = (index: number) => {
  const values = ['-1.5deg', '1.2deg', '-0.6deg', '1.6deg', '-1deg', '0.8deg'];
  return values[index % values.length];
};
