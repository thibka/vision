-- content is the Contenu of the Page, BlockNote's document as JSON (ADR 0002). NULL until the Page is first written.
ALTER TABLE pages ADD COLUMN content TEXT;
