from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime

from src.config.database import get_session
from src.dependencies.auth import get_current_user, get_optional_user
from src.dependencies.rbac import admin_required
from src.models.user import User
from src.models.blog import BlogPost
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/blogs", tags=["Blogs"])

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    cover_image: Optional[str] = None
    is_published: bool = False

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    is_published: Optional[bool] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    post: BlogPostCreate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    # Check duplicate slug
    existing = db.exec(select(BlogPost).where(BlogPost.slug == post.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="A post with this slug already exists.")
        
    db_post = BlogPost(
        title=post.title,
        slug=post.slug,
        content=post.content,
        cover_image=post.cover_image,
        is_published=post.is_published,
        author_id=current_admin.id,
        published_at=datetime.utcnow() if post.is_published else None
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("")
async def list_blogs(
    is_published: Optional[bool] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_session)
):
    query = select(BlogPost)
    
    # If not admin, force only published
    if not current_user or current_user.role != "ADMIN":
        query = query.where(BlogPost.is_published == True)
    elif is_published is not None:
        query = query.where(BlogPost.is_published == is_published)
        
    query = query.order_by(BlogPost.created_at.desc())
    posts = db.exec(query).all()
    return posts

@router.get("/{slug}")
async def get_blog(
    slug: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_session)
):
    post = db.exec(select(BlogPost).where(BlogPost.slug == slug)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
        
    if not post.is_published:
        if not current_user or current_user.role != "ADMIN":
            raise HTTPException(status_code=404, detail="Blog post not found.")
            
    return post

@router.put("/{post_id}")
async def update_blog(
    post_id: UUID,
    update_data: BlogPostUpdate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
        
    update_dict = update_data.dict(exclude_unset=True)
    if "is_published" in update_dict:
        if update_dict["is_published"] and not post.is_published:
            post.published_at = datetime.utcnow()
            
    for key, value in update_dict.items():
        setattr(post, key, value)
        
    post.updated_at = datetime.utcnow()
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_blog(
    post_id: UUID,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    post = db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
        
    db.delete(post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
