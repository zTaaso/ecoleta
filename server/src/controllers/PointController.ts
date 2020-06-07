import { Request, Response } from 'express';
import knex from '../database/connection';

class PointController {
	async index(req: Request, res: Response) {
		const { city, uf, items } = req.query;

		if (!city && !uf && !items) {
			const points = await knex('points').select('*');
			return res.json(points);
		}

		const parsedItems = String(items)
			.split(',')
			.map((i) => Number(i.trim()));

		const points = await knex('points')
			.join('point_items', 'points.id', '=', 'point_items.point_id')
			.whereIn('point_items.item_id', parsedItems)
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*');

		const serializedIPoints = points.map((point) => ({
			...point,
			image_url: `http://192.168.0.104:3333/uploads/${point.image}`,
		}));

		return res.json({ points: serializedIPoints });
	}

	async store(req: Request, res: Response) {
		const {
			image,
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items,
		} = req.body;

		const trx = await knex.transaction();

		const [point_id] = await trx('points').insert({
			image: req.file.filename,
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		});

		const pointItems = items
			.split(',')
			.map((i: string) => Number(i.trim()))
			.map((i: number) => ({
				item_id: i,
				point_id,
			}));

		await trx('point_items').insert(pointItems);
		await trx.commit();

		return res.json({ pinto: 'ok', pointItems, point_id });
	}

	async show(req: Request, res: Response) {
		const { id } = req.params;

		const point = await knex('points').where('id', id).first();

		if (!point) {
			return res.status(400).json({ error: 'Point not found' });
		}

		const items = await knex('items')
			.join('point_items', 'items.id', '=', 'point_items.item_id')
			.where('point_items.point_id', id)
			.select('title');

		const serializedPoint = {
			...point,
			image_url: `http://192.168.0.104:3333/uploads/${point.image}`,
		};

		return res.json({ point: serializedPoint, items });
	}

	async delete(req: Request, res: Response) {
		const { id } = req.params;

		const pointId = await knex('points').where('id', id).delete('*');

		if (!pointId) {
			return res.status(400).json({ message: 'Invalid id.' });
		}

		return res.json({ message: 'Point was sucessfully deleted.', pointId });
	}
}

export default new PointController();
