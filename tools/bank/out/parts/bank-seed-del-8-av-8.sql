-- bank-seed del 8 av 8: kopplingar mellan övningar + kontroll.
begin;
update public.exercises set progression_of = 'tech-landning-plint', regression_of = 'tech-formhopp-over-block' where id = 'tech-grenhopp-trampett';
update public.exercises set progression_of = 'tech-grenhopp-trampett' where id = 'tech-formhopp-over-block';
update public.exercises set regression_of = 'tech-hjul' where id = 'tech-minihjul';
update public.exercises set progression_of = 'tech-balansgang' where id = 'tech-soldatsparkar-bom';
update public.exercises set regression_of = 'tech-grenhopp-trampett' where id = 'tech-landning-plint';
commit;
select (select count(*) from public.exercises where status = 'published') as ovningar_publicerade, (select count(*) from public.redskap) as redskap;
