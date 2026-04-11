-- Polymorphic likes: targetId cannot reference both Post and Comment.
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "post_like_fk";
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "comment_like_fk";
